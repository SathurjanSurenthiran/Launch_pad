import express from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { toggleLike, getProjectLikes } from "../controllers/like.controller.js";
import {
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowStats,
} from "../controllers/follow.controller.js";

const router = express.Router();

// Likes Endpoints
router.post("/projects/:id/like", authenticate, toggleLike);
router.get("/projects/:id/likes", optionalAuthenticate, getProjectLikes);

// Follows Endpoints
router.post("/users/:id/follow", authenticate, toggleFollow);
router.get("/users/:id/followers", optionalAuthenticate, getFollowers);
router.get("/users/:id/following", optionalAuthenticate, getFollowing);
router.get("/users/:id/follow-stats", optionalAuthenticate, getFollowStats);

export default router;
