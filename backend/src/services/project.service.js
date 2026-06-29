import { uploadImage, deleteImage, extractPublicId } from "../utils/cloudinary.js";
import { projectRepository, eventEmitter } from "../container/container.js";
import EVENTS from "../events/event-names.js";
import NotFoundException from "../exceptions/not-found.exception.js";
import AuthorizationException from "../exceptions/authorization.exception.js";
import ValidationException from "../exceptions/validation.exception.js";
import { sanitizeInput } from "../utils/sanitization.js";

/**
 * Validates and sanitizes pagination values.
 * @param {any} page 
 * @param {any} limit 
 * @returns {{page: number, limit: number}}
 */
const validatePagination = (page, limit) => {
  const p = Number(page);
  const l = Number(limit);

  if (isNaN(p) || isNaN(l) || p <= 0 || l <= 0 || !Number.isInteger(p) || !Number.isInteger(l)) {
    throw new ValidationException("Page and limit must be positive integers");
  }
  if (l > 50) {
    throw new ValidationException("Limit cannot exceed 50");
  }
  return { page: p, limit: l };
};

/**
 * Creates a new student project and uploads its cover image & images gallery.
 */
export const createProject = async (userId, data, files) => {
  if (!files || !files.coverImage || files.coverImage.length === 0) {
    throw new ValidationException("Cover image is required");
  }

  // Upload cover image
  const coverImageUrl = await uploadImage(files.coverImage[0].buffer, "projects");

  // Upload image gallery (max 5)
  const imageUrls = [];
  if (files.images && files.images.length > 0) {
    const galleryFiles = files.images.slice(0, 5); // limit to 5
    for (const file of galleryFiles) {
      const url = await uploadImage(file.buffer, "projects");
      imageUrls.push(url);
    }
  }

  // Sanitize title and description
  const sanitizedTitle = sanitizeInput(data.title);
  const sanitizedDescription = sanitizeInput(data.description);

  const project = await projectRepository.create({
    owner: userId,
    title: sanitizedTitle,
    description: sanitizedDescription,
    coverImage: coverImageUrl,
    images: imageUrls,
    techStack: data.techStack || [],
    demoLink: data.demoLink || "",
    githubLink: data.githubLink || "",
    category: data.category,
    status: "PENDING", // Awaiting approval
  });

  // Emit event (fire-and-forget)
  eventEmitter.emit(EVENTS.PROJECT_CREATED, {
    projectId: project._id,
    ownerId: project.owner,
    projectTitle: project.title,
  });

  return project;
};

/**
 * Queries projects with filters, pagination, and status checks depending on the caller's role.
 */
export const getProjects = async (filters, page = 1, limit = 12, requestingUser = null) => {
  const { page: p, limit: l } = validatePagination(page, limit);
  const query = {};

  if (requestingUser) {
    if (requestingUser.role === "ADMIN") {
      if (filters.status) {
        query.status = filters.status;
      }
    } else {
      // Student: see APPROVED or their own
      query.$or = [
        { status: "APPROVED" },
        { owner: requestingUser.userId },
      ];

      if (filters.status) {
        if (filters.status === "APPROVED") {
          query.status = "APPROVED";
          delete query.$or;
        } else {
          // View non-approved projects: must be their own
          query.status = filters.status;
          query.owner = requestingUser.userId;
          delete query.$or;
        }
      }
    }
  } else {
    // Public: only APPROVED
    query.status = "APPROVED";
  }

  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Tech stack filter
  if (filters.techStack) {
    const techArray = Array.isArray(filters.techStack)
      ? filters.techStack
      : filters.techStack.split(",").map((t) => t.trim()).filter(Boolean);
    if (techArray.length > 0) {
      query.techStack = { $in: techArray };
    }
  }

  let sort = { createdAt: -1 };
  if (filters.sortBy === "likes") {
    sort = { likeCount: -1, createdAt: -1 };
  } else if (filters.sortBy === "oldest") {
    sort = { createdAt: 1 };
  }

  return await projectRepository.findWithPagination(query, p, l, sort);
};

/**
 * Searches projects using Mongo $text index with filters and pagination.
 */
export const searchProjects = async (textQuery, filters, page = 1, limit = 12, requestingUser = null) => {
  const { page: p, limit: l } = validatePagination(page, limit);
  const queryFilters = {};

  if (requestingUser) {
    if (requestingUser.role === "ADMIN") {
      if (filters.status) {
        queryFilters.status = filters.status;
      }
    } else {
      queryFilters.$or = [
        { status: "APPROVED" },
        { owner: requestingUser.userId },
      ];

      if (filters.status) {
        if (filters.status === "APPROVED") {
          queryFilters.status = "APPROVED";
          delete queryFilters.$or;
        } else {
          queryFilters.status = filters.status;
          queryFilters.owner = requestingUser.userId;
          delete queryFilters.$or;
        }
      }
    }
  } else {
    queryFilters.status = "APPROVED";
  }

  if (filters.category) {
    queryFilters.category = filters.category;
  }

  if (filters.techStack) {
    const techArray = Array.isArray(filters.techStack)
      ? filters.techStack
      : filters.techStack.split(",").map((t) => t.trim()).filter(Boolean);
    if (techArray.length > 0) {
      queryFilters.techStack = { $in: techArray };
    }
  }

  return await projectRepository.searchProjects(textQuery, queryFilters, p, l);
};

/**
 * Fetches a single project by ID, verifies access, and increments viewCount.
 */
export const getProjectById = async (projectId, requestingUser = null) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  const isOwner = requestingUser && project.owner.toString() === requestingUser.userId.toString();
  const isAdmin = requestingUser && requestingUser.role === "ADMIN";

  if (project.status !== "APPROVED" && !isOwner && !isAdmin) {
    throw new AuthorizationException("You are not authorized to view this project");
  }

  // Increment viewCount
  await projectRepository.incrementViews(projectId);
  
  // Return the populated project
  const populated = await projectRepository.model
    .findById(projectId)
    .populate("owner", "name email profilePicture role");
    
  return populated;
};

/**
 * Updates project details. Re-verifies ownership, swaps Cloudinary assets, and resets status to PENDING.
 */
export const updateProject = async (projectId, userId, role, data, files) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  // Verify ownership
  if (project.owner.toString() !== userId.toString()) {
    throw new AuthorizationException("You are not authorized to update this project");
  }

  const updateData = {
    status: "PENDING", // Status resets to PENDING
    rejectionReason: "", // Clear old rejection reasons
  };

  if (data.title !== undefined) {
    updateData.title = sanitizeInput(data.title);
  }
  if (data.description !== undefined) {
    updateData.description = sanitizeInput(data.description);
  }
  if (data.techStack !== undefined) updateData.techStack = data.techStack;
  if (data.demoLink !== undefined) updateData.demoLink = data.demoLink;
  if (data.githubLink !== undefined) updateData.githubLink = data.githubLink;
  if (data.category !== undefined) updateData.category = data.category;

  // Upload cover image replacement
  if (files && files.coverImage && files.coverImage.length > 0) {
    const oldPublicId = extractPublicId(project.coverImage);
    if (oldPublicId) {
      await deleteImage(oldPublicId).catch((err) =>
        console.error(`Failed to delete old cover image: ${err.message}`)
      );
    }
    updateData.coverImage = await uploadImage(files.coverImage[0].buffer, "projects");
  }

  // Upload image gallery replacement
  if (files && files.images && files.images.length > 0) {
    // Delete old gallery images
    for (const url of project.images) {
      const oldPublicId = extractPublicId(url);
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) =>
          console.error(`Failed to delete old gallery image: ${err.message}`)
        );
      }
    }
    
    // Upload new gallery images
    const newImages = [];
    const galleryFiles = files.images.slice(0, 5);
    for (const file of galleryFiles) {
      const url = await uploadImage(file.buffer, "projects");
      newImages.push(url);
    }
    updateData.images = newImages;
  }

  const updatedProject = await projectRepository.updateById(projectId, updateData);

  // Emit event if status changed to PENDING (fire-and-forget)
  eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
    projectId: updatedProject._id,
    ownerId: updatedProject.owner,
    projectTitle: updatedProject.title,
    status: "PENDING",
    actorId: userId,
  });

  return updatedProject;
};

/**
 * Deletes a project and its associated Cloudinary files.
 */
export const deleteProject = async (projectId, userId, role) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  const isOwner = project.owner.toString() === userId.toString();
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new AuthorizationException("You are not authorized to delete this project");
  }

  // Cloudinary cleanup
  const coverPublicId = extractPublicId(project.coverImage);
  if (coverPublicId) {
    await deleteImage(coverPublicId).catch((err) => console.error(err));
  }

  for (const url of project.images) {
    const publicId = extractPublicId(url);
    if (publicId) {
      await deleteImage(publicId).catch((err) => console.error(err));
    }
  }

  await projectRepository.deleteById(projectId);
  return { success: true };
};

/**
 * ADMIN status overrides. Allowed statuses: APPROVED, REJECTED, HIDDEN.
 */
export const adminUpdateStatus = async (projectId, adminId, status, rejectionReason) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  const allowedStatuses = ["APPROVED", "REJECTED", "HIDDEN"];
  if (!allowedStatuses.includes(status)) {
    throw new ValidationException(`Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  if (status === "REJECTED" && (!rejectionReason || rejectionReason.trim() === "")) {
    throw new ValidationException("Rejection reason is required when status is REJECTED");
  }

  const updateData = {
    status,
    rejectionReason: status === "REJECTED" ? sanitizeInput(rejectionReason) : "",
  };

  const updatedProject = await projectRepository.updateById(projectId, updateData);

  // Emit event (fire-and-forget)
  eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
    projectId: updatedProject._id,
    ownerId: updatedProject.owner,
    projectTitle: updatedProject.title,
    status,
    rejectionReason: updateData.rejectionReason,
    actorId: adminId,
  });

  return updatedProject;
};

/**
 * Sets project status to HIDDEN.
 */
export const hideProject = async (projectId, userId) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new AuthorizationException("You are not authorized to hide this project");
  }

  const updatedProject = await projectRepository.updateById(projectId, { status: "HIDDEN" });

  // Emit event (fire-and-forget)
  eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
    projectId: updatedProject._id,
    ownerId: updatedProject.owner,
    projectTitle: updatedProject.title,
    status: "HIDDEN",
    actorId: userId,
  });

  return updatedProject;
};

/**
 * Transitions project back to PENDING. Valid only from HIDDEN/REJECTED.
 */
export const resubmitProject = async (projectId, userId) => {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundException("Project not found");
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new AuthorizationException("You are not authorized to resubmit this project");
  }

  if (project.status !== "HIDDEN" && project.status !== "REJECTED") {
    throw new ValidationException("Project can only be resubmitted from HIDDEN or REJECTED states");
  }

  const updatedProject = await projectRepository.updateById(projectId, {
    status: "PENDING",
    rejectionReason: "",
  });

  // Emit event (fire-and-forget)
  eventEmitter.emit(EVENTS.PROJECT_STATUS_CHANGED, {
    projectId: updatedProject._id,
    ownerId: updatedProject.owner,
    projectTitle: updatedProject.title,
    status: "PENDING",
    actorId: userId,
  });

  return updatedProject;
};

export default {
  createProject,
  getProjects,
  searchProjects,
  getProjectById,
  updateProject,
  deleteProject,
  adminUpdateStatus,
  hideProject,
  resubmitProject,
};
