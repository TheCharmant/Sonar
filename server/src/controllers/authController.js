import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { auth } from "../config/firebase.js";
import { createUser } from "../models/userModel.js";
import { getAuthUrl, getTokens, getUserInfo, oauthClient } from "../config/oauth.js";
import { db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

dotenv.config();

const generateToken = (uid) => jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const googleLogin = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing UID" });

  const token = generateToken(uid);
  const url = getAuthUrl(token);

  // ✅ Make sure you return proper JSON
  res.json({ url }); // ← this must always happen
};


export const oauthCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).json({ error: "Missing parameters" });

  let uid;
  try {
    uid = jwt.verify(state, process.env.JWT_SECRET).uid;
  } catch (err) {
    return res.status(401).json({ error: "Invalid state token" });
  }

  try {
    console.log("Getting tokens...");
    const tokens = await getTokens(code);
    console.log("Tokens received:", tokens);
  
    oauthClient.setCredentials(tokens);
  
    console.log("Fetching user info...");
    const userInfo = await getUserInfo(tokens.access_token);
    console.log("User info:", userInfo);
  
    const { email, name } = userInfo;
    
    // Check if this Gmail account is already connected to a user
    const existingTokensSnapshot = await db.collection("oauth_tokens")
      .where("gmail_email", "==", email)
      .get();
    
    let isNewAccount = false;
    
    if (!existingTokensSnapshot.empty) {
      const existingDoc = existingTokensSnapshot.docs[0];
      const existingUid = existingDoc.id;
      
      if (existingUid !== uid) {
        console.log("Gmail account found with different UID, using existing account");
        // Instead of returning an error, use the existing account's UID
        uid = existingUid;
      }
    } else {
      isNewAccount = true;
    }
  
    try {
      console.log("Checking Firebase user...");
      await auth.getUser(uid); // This checks if the user already exists in Firebase
      console.log("User found, skipping creation...");
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log("User not found, creating new user...");
        try {
          await auth.createUser({ uid, email });
          await createUser(uid, email, name);
          isNewAccount = true;
        } catch (createErr) {
          console.error("Error creating user:", createErr);
        }
      } else if (err.code === 'auth/email-already-exists') {
        console.log("Email already exists, skipping creation...");
      } else {
        console.error("Error getting user:", err);
        return res.status(500).json({ error: "Failed to verify user" });
      }
    }
  
    console.log("Saving tokens to Firestore...");
    // Store the Gmail email along with the tokens for future checks
    await db.collection("oauth_tokens").doc(uid).set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
      id_token: tokens.id_token,
      gmail_email: email,
      last_updated: new Date().toISOString()
    });
    
    const newToken = generateToken(uid);
    
    // Create audit log for the login or signup
    await createAuditLog({
      user: email,
      role: "user",
      type: AuditLogTypes.AUTH,
      action: isNewAccount ? AuditLogActions.USER_CREATED : AuditLogActions.LOGIN,
      metadata: {
        uid,
        method: "google_oauth",
        timestamp: new Date().toISOString()
      }
    });
  
    console.log("Redirecting to frontend...");
    const frontendUrls = process.env.FRONTEND_URLS?.split(',') ?? [];
    const redirectUrl = frontendUrls[0];
    res.redirect(`${redirectUrl}/dashboard?token=${newToken}`);
  } catch (err) {
    console.error("OAuth callback failed:", err);
    return res.status(500).json({ error: "OAuth callback error" });
  }
};
