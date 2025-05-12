import { auth } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";

// Helper function to generate JWT for the admin
const generateToken = (uid, role) => {
  return jwt.sign({ uid, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔐 Email/password admin login
export const adminLogin = async (req, res) => {
  const { token } = req.body;  // Expecting the Firebase ID token sent from client-side

  if (!token) return res.status(400).json({ error: "Missing Firebase ID token" });

  try {
    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid } = decodedToken;

    // Check if this user exists in the 'admins' collection
    const adminDoc = await db.collection("admins").doc(uid).get();
    if (!adminDoc.exists) return res.status(403).json({ error: "Not an admin" });

    // Generate JWT for the admin
    const adminToken = generateToken(uid, "admin");

    // Send back the JWT
    return res.json({ token: adminToken });
  } catch (err) {
    console.error("Admin login failed:", err);
    return res.status(401).json({ error: "Invalid login or token" });
  }
};



// 🧠 Optional: Google login for pre-approved admin accounts
export const adminGoogleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const tokens = await getTokens(code);
    oauthClient.setCredentials(tokens);
    const userInfo = await getUserInfo(tokens.access_token);
    const { email } = userInfo;

    // Look up user by email in admins collection
    const snapshot = await db.collection("admins").where("email", "==", email).get();
    if (snapshot.empty) return res.status(403).json({ error: "Not authorized" });

    // You could also create Firebase user or sync data here
    const [adminDoc] = snapshot.docs;
    const uid = adminDoc.id;

    const token = generateToken(uid, "admin");
    return res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard?token=${token}`);
  } catch (err) {
    console.error("Admin Google OAuth failed:", err);
    return res.status(500).json({ error: "OAuth error" });
  }
};
