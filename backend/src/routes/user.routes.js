import express from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateProfile as updateProfileValidator } from "../validators/user.validator.js";
import { uploadLimiter } from "../middlewares/rate-limit.middleware.js";
import {
  getMyProfile,
  updateProfile,
  getUserProfile,
  getUserProjects,
} from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users/me (Rich self-profile retrieval)
router.get("/me", authenticate, getMyProfile);

// PATCH /api/users/me (Update allowed profile fields + upload avatar)
router.patch(
  "/me",
  authenticate,
  uploadLimiter,
  uploadSingle("profilePicture"),
  validate(updateProfileValidator),
  updateProfile
);

// GET /api/users/:id (View active user profile)
router.get("/:id", optionalAuthenticate, getUserProfile);

// GET /api/users/:id/projects (Get active user projects)
router.get("/:id/projects", optionalAuthenticate, getUserProjects);

export default router;
