import express from "express";
import { adminLogin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Admin authentication routes
router.post("/login", adminLogin);

export default router;
