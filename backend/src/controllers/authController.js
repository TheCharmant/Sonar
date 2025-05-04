import { auth } from "../config/firebase.js";
import { createUser, getUserById } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getAuthUrl } from "../config/oauth.js";  // Add this import


dotenv.config();


const generateToken = (uid) => {
    return jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Function to save OAuth tokens in Firestore
export const saveOAuthTokens = async (uid, tokens) => {
    try {
        await db.collection("oauth_tokens").doc(uid).set(tokens);
        console.log("✅ OAuth Tokens Saved to Firestore");
    } catch (error) {
        console.error("❌ Error saving tokens:", error);
    }
};

// ✅ Function to get OAuth tokens from Firestore
export const getOAuthTokens = async (uid) => {
    try {
        const doc = await db.collection("oauth_tokens").doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error("❌ Error retrieving tokens:", error);
        return null;
    }
};

// ✅ Signup
export const signup = async (req, res) => {
    try {
        console.log("Received Body:", req.body);  // Debugging Log

        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) 
            return res.status(400).json({ success: false, error: "All fields are required!" });

        const userRecord = await auth.createUser({ email, password });
        const newUser = await createUser(userRecord.uid, email, fullName);
        const token = generateToken(userRecord.uid);

        res.status(201).json({ success: true, user: newUser, token, message: "User registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};


// ✅ Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required!" });
        }

        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        // ✅ Generate JWT
        const token = generateToken(userRecord.uid);

        // ✅ Pass JWT as `state` param to Google OAuth
        const googleAuthUrl = getAuthUrl(token);  // Move it here

        res.status(200).json({
            success: true,
            message: "Login successful, please connect your Gmail!",
            token,
            googleAuthUrl
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(400).json({ success: false, error: error.message });
    }
};



// ✅ Get Current User Profile
export const getProfile = async (req, res) => {
    try {
        const user = await getUserById(req.user.uid);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};