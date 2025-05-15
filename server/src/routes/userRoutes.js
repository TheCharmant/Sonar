import express from "express";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// User profile routes
router.get("/profile", requireRole("any"), (req, res) => {
  res.status(200).json({ user: req.user });
});

// Update own profile
router.put("/profile", requireRole("any"), async (req, res) => {
  try {
    const { name } = req.body;
    const uid = req.user.uid;
    
    await db.collection("users").doc(uid).update({
      name: name || ""
    });
    
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
