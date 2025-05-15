import express from "express";
import {
  googleLogin,
  oauthCallback,
  checkGmailConnection,
  connectGmail,
  disconnectGmail
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authentication routes
router.post("/google", googleLogin);
router.get("/callback", oauthCallback);

// Gmail connection routes
router.get("/status", authMiddleware, checkGmailConnection);
router.get("/gmail/connect", authMiddleware, connectGmail);
router.post("/gmail/disconnect", authMiddleware, disconnectGmail);

export default router;