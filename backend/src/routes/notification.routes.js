import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// GET /api/notifications
router.get("/", authenticate, getMyNotifications);

// GET /api/notifications/unread-count
router.get("/unread-count", authenticate, getUnreadCount);

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, markAsRead);

export default router;
