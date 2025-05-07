import express from "express";
import { fetchEmails, fetchEmailDetail } from "../controllers/emailController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/fetch", authMiddleware, fetchEmails);
router.get("/detail", authMiddleware, fetchEmailDetail);

export default router;
