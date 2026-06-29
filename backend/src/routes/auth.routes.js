import express from "express";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { loginWithGoogle, getMe, logout } from "../controllers/auth.controller.js";
import { googleLogin } from "../validators/auth.validator.js";
import { strictAuthLimiter } from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

// POST /api/auth/google
router.post("/google", strictAuthLimiter, validate(googleLogin), loginWithGoogle);

// GET /api/auth/me
router.get("/me", authenticate, getMe);

// POST /api/auth/logout
router.post("/logout", logout);

export default router;
