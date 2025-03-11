import { auth } from "../config/firebase.js";
import { createUser, getUserById } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (uid) => {
    return jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Signup
export const signup = async (req, res) => {
    try {
        console.log("Received Body:", req.body);  // Debugging Log

        const { email, password, name } = req.body;
        if (!email || !password || !name) 
            return res.status(400).json({ success: false, error: "All fields are required!" });

        const userRecord = await auth.createUser({ email, password });
        const newUser = await createUser(userRecord.uid, email, name);
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
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: "Email is required!" });

        const userRecord = await auth.getUserByEmail(email);
        const userData = await getUserById(userRecord.uid);
        if (!userData) return res.status(400).json({ success: false, error: "User not found in database" });

        const token = generateToken(userRecord.uid);
        res.status(200).json({ success: true, user: userData, token, message: "Login successful!" });
    } catch (error) {
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