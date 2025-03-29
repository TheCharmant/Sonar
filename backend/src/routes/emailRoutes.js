import express from "express";
import { getTokens } from "../config/oauth.js";
import { getEmails } from "../services/emailService.js"; // Import email service
import { generateEmailReport } from "../services/reportService.js"; // Import report service

const router = express.Router();

// ✅ OAuth Callback - Exchanges code for tokens & saves them
router.get("/callback", async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ error: "Missing authorization code" });

        const uid = "lejANVkRRVgQWpImGkDVCkCErEl1"; // Temporary hardcoded UID

        await getTokens(code, uid); // Exchange code for tokens
        console.log("🔑 OAuth Tokens Saved!");

        res.json({ message: "OAuth authentication successful!" });
    } catch (error) {
        console.error("❌ Error retrieving tokens:", error);
        res.status(500).json({ error: "Failed to retrieve and store tokens." });
    }
});

// ✅ Fetch Full Emails - Calls getEmails() from emailService
router.get("/fetch", async (req, res) => {
    try {
        const uid = "lejANVkRRVgQWpImGkDVCkCErEl1"; // Temporary hardcoded UID
        const { success, emails } = await getEmails(uid); // Fetch emails with full details

        if (!success) {
            return res.status(400).json({ error: "Failed to fetch emails" });
        }

        res.json(emails);
    } catch (error) {
        console.error("❌ Error fetching emails:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch Email Reports - Calls generateEmailReport() from reportService
router.get("/report", async (req, res) => {
    try {
        const uid = "lejANVkRRVgQWpImGkDVCkCErEl1"; // Temporary hardcoded UID
        const { success, emails } = await getEmails(uid); // Fetch emails with full details

        if (!success || emails.length === 0) {
            return res.status(400).json({ error: "No emails available to generate report" });
        }

        // Generate the email report and send as response
        const report = await generateEmailReport(emails);

        res.json(report);
    } catch (error) {
        console.error("❌ Error generating email report:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
