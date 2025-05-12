import express from "express";
import {
  fetchEmails,
  fetchEmailDetail,
  fetchAllEmailsForAdmin
} from "../controllers/emailController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/fetch", authMiddleware, fetchEmails);
router.get("/detail", authMiddleware, fetchEmailDetail);
router.get("/admin/all", authMiddleware, fetchAllEmailsForAdmin);

export default router;
