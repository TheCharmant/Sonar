import express from "express";
import { googleLogin, oauthCallback } from "../controllers/authController.js";
const router = express.Router();

router.post("/google", googleLogin);
router.get("/callback", oauthCallback);

export default router;