import express from "express";
import { getPublicStats } from "../controllers/stats.controller.js";

const router = express.Router();

// GET /api/stats (Public — no auth required)
router.get("/", getPublicStats);

export default router;
