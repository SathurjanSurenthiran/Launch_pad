import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateRole } from "../validators/admin.validator.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getAllProjects,
  adminUpdateStatus,
  deleteProject,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Enforce admin privileges for all endpoints
router.use(authenticate, authorize("ADMIN"));

// GET /api/admin/dashboard (Dashboard stats)
router.get("/dashboard", getDashboardStats);

// GET /api/admin/users (Search and list users)
router.get("/users", getAllUsers);

// GET /api/admin/users/:id (View user profile details + stats)
router.get("/users/:id", getUserById);

// PATCH /api/admin/users/:id/role (Update user role with limits)
router.patch("/users/:id/role", validate(updateRole), updateUserRole);

// PATCH /api/admin/users/:id/deactivate (Lock user account + hide projects)
router.patch("/users/:id/deactivate", deactivateUser);

// PATCH /api/admin/users/:id/reactivate (Unlock user account)
router.patch("/users/:id/reactivate", reactivateUser);

// GET /api/admin/projects (Search and list projects of any status)
router.get("/projects", getAllProjects);

// PATCH /api/admin/projects/:id/status (Approve/Reject/Hide project status)
router.patch("/projects/:id/status", adminUpdateStatus);

// DELETE /api/admin/projects/:id (Hard delete any project from database & Cloudinary)
router.delete("/projects/:id", deleteProject);

export default router;
