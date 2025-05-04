import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { auth } from "../config/firebase.js"; // Firebase Admin SDK
import { getTokens, getGoogleUserInfo, saveOAuthTokens, getStoredTokens } from "../config/oauth.js";
import { createUser } from "../models/userModel.js";
import { getEmails } from "../services/emailService.js";
import { generateEmailReport } from "../services/reportService.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

dotenv.config();

const router = express.Router();

// 🔑 Reusable JWT generator
const generateToken = (uid) => {
    return jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ OAuth Callback Route
router.get("/callback", async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).json({ error: "Missing code or state" });
        }

        // 🧪 Decode the state JWT to extract UID
        let uid;
        try {
            const decoded = jwt.verify(state, process.env.JWT_SECRET);
            uid = decoded.uid;
        } catch (err) {
            console.error("❌ JWT verification failed:", err.message);
            return res.status(401).json({ error: "Invalid or expired state token" });
        }

        // 🔄 Exchange auth code for access/refresh tokens
        const tokens = await getTokens(code);

        // 👤 Fetch user info from Google using access token
        const userInfo = await getGoogleUserInfo(tokens.access_token);
        console.log("✅ Google user info:", userInfo);

        const { email, name } = userInfo;

        // 🔄 Check if Firebase user exists, create if needed
        try {
            await auth.getUser(uid);
        } catch (err) {
            const firebaseUser = await auth.createUser({ uid, email });
            await createUser(uid, email, name);
        }

        // 💾 Save tokens in Firestore
        await saveOAuthTokens(uid, tokens);

        // 🔁 Generate a new JWT
        const newToken = generateToken(uid);

        res.json({ success: true, token: newToken, message: "Google OAuth successful!" });
    } catch (error) {
        console.error("❌ OAuth callback error:", error);
        res.status(500).json({ error: "Google authentication failed." });
    }
});

// 📥 Fetch Gmail emails
router.get("/fetch", authMiddleware, async (req, res) => {
    try {
        const uid = req.user.uid;
        const tokens = await getStoredTokens(uid);

        if (!tokens) return res.status(400).json({ error: "OAuth tokens not available" });

        const { success, emails } = await getEmails(uid, tokens.access_token);

        if (!success) return res.status(400).json({ error: "Failed to fetch emails" });

        res.json(emails);
    } catch (error) {
        console.error("❌ Error fetching emails:", error);
        res.status(500).json({ error: error.message });
    }
});

// 📊 Generate email report
router.get("/report", authMiddleware, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { success, emails } = await getEmails(uid);

        if (!success || emails.length === 0)
            return res.status(400).json({ error: "No emails available to generate report" });

        const report = await generateEmailReport(emails);
        res.json(report);
    } catch (error) {
        console.error("❌ Error generating email report:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
