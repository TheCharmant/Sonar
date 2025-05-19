import express from "express";
import { requireRole } from "../middlewares/requireRole.js";
import { getCurrentUserProfile } from "../controllers/userController.js";

const router = express.Router();

// User profile routes
router.get("/profile", requireRole("any"), getCurrentUserProfile);

export default router;
