import express from "express";
import {
  fetchEmails,
  fetchEmailDetail,
  fetchAllEmailsForAdmin,
  getUserLabels
} from "../controllers/emailController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/fetch", authMiddleware, fetchEmails);
router.get("/detail", authMiddleware, fetchEmailDetail);
router.get("/admin/all", authMiddleware, fetchAllEmailsForAdmin);
router.get("/labels", authMiddleware, getUserLabels);

export default router;
