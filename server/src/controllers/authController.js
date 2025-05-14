import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { auth } from "../config/firebase.js";
import { createUser } from "../models/userModel.js";
import { getAuthUrl, getTokens, getUserInfo, oauthClient } from "../config/oauth.js";
import { db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions, LogSeverity } from "../utils/auditLogger.js";

dotenv.config();

const generateToken = (uid) => jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const googleLogin = async (req, res) => {
  const { uid } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  if (!uid) {
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_FAILED,
      performedBy: "unknown",
      details: {
        reason: "Missing UID",
        ipAddress,
        userAgent,
        method: "google_oauth_init"
      },
      severity: LogSeverity.WARNING
    });
    return res.status(400).json({ error: "Missing UID" });
  }

  try {
    const token = generateToken(uid);
    const url = getAuthUrl(token);
    
    res.json({ url });
  } catch (error) {
    console.error("Google login error:", error);
    
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_FAILED,
      performedBy: uid || "unknown",
      details: {
        reason: "OAuth URL generation failed",
        error: error.message,
        ipAddress,
        userAgent
      },
      severity: LogSeverity.ERROR
    });
    
    res.status(500).json({ error: "Failed to generate authentication URL" });
  }
};


export const oauthCallback = async (req, res) => {
  const { code, state } = req.query;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  if (!code || !state) {
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_FAILED,
      performedBy: "unknown",
      details: {
        reason: "Missing OAuth parameters",
        ipAddress,
        userAgent,
        method: "google_oauth_callback"
      },
      severity: LogSeverity.WARNING
    });
    return res.status(400).json({ error: "Missing parameters" });
  }

  let uid;
  try {
    uid = jwt.verify(state, process.env.JWT_SECRET).uid;
  } catch (err) {
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_FAILED,
      performedBy: "unknown",
      details: {
        reason: "Invalid state token",
        error: err.message,
        ipAddress,
        userAgent,
        method: "google_oauth_callback"
      },
      severity: LogSeverity.WARNING
    });
    return res.status(401).json({ error: "Invalid state token" });
  }

  try {
    console.log("Getting tokens...");
    const tokens = await getTokens(code);
    console.log("Tokens received:", tokens);
  
    oauthClient.setCredentials(tokens);
  
    console.log("Fetching user info...");
    const userInfo = await getUserInfo(tokens.access_token);
    
    // Check if email already exists in Firebase before proceeding
    const { email } = userInfo;
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        // Email exists, use this account instead of creating a new one
        uid = existingUser.uid;
        console.log(`Email ${email} already exists, using existing account`);
      }
    } catch (err) {
      // Email doesn't exist, will continue with normal flow
      console.log(`Email ${email} not found, will create new user if needed`);
    }
  
    const { name } = userInfo;
    
    // Check if this Gmail account is already connected to a user
    const existingTokensSnapshot = await db.collection("oauth_tokens")
      .where("gmail_email", "==", email)
      .get();
    
    let isNewAccount = false;
    let accountSwitched = false;
    let originalUid = uid;
    
    if (!existingTokensSnapshot.empty) {
      const existingDoc = existingTokensSnapshot.docs[0];
      const existingUid = existingDoc.id;
      
      if (existingUid !== uid) {
        console.log("Gmail account found with different UID, using existing account");
        accountSwitched = true;
        originalUid = uid;
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
          
          // Explicitly create user document in Firestore users collection
          const userData = {
            name,
            email,
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            lastLoginIP: ipAddress,
            lastLoginUserAgent: userAgent
          };
          
          // Directly store in users collection
          await db.collection("users").doc(uid).set(userData);
          console.log("User document created in users collection:", uid);
          
          // Also call createUser for any additional logic it might contain
          await createUser(uid, email, name, userData);
          console.log("User created successfully in Firestore:", uid);
          
          isNewAccount = true;
        } catch (createErr) {
          console.error("Error creating user:", createErr);
          
          if (createErr.code !== 'auth/email-already-exists') {
            await createAuditLog({
              type: AuditLogTypes.USER_MGMT,
              action: "user_creation_failed",
              performedBy: "system",
              details: {
                email,
                error: createErr.message,
                ipAddress,
                userAgent
              },
              severity: LogSeverity.ERROR
            });
          }
        }
      } else if (err.code === 'auth/email-already-exists') {
        console.log("Email already exists, skipping creation...");
      } else {
        console.error("Error getting user:", err);
        
        await createAuditLog({
          type: AuditLogTypes.AUTH,
          action: AuditLogActions.LOGIN_FAILED,
          performedBy: uid,
          details: {
            email,
            error: err.message,
            ipAddress,
            userAgent
          },
          severity: LogSeverity.ERROR
        });
        
        return res.status(500).json({ error: "Failed to verify user" });
      }
    }

    // Check if the user account is deactivated
    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      
      if (userData.status === 'inactive') {
        console.log(`User ${uid} (${email}) is deactivated, rejecting login`);
        
        // Log the failed login attempt
        await createAuditLog({
          type: AuditLogTypes.AUTH,
          action: AuditLogActions.LOGIN_FAILED,
          performedBy: uid,
          details: {
            email,
            reason: "Account deactivated",
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          },
          severity: LogSeverity.WARNING
        });
        
        // Redirect to login page with error
        const frontendUrls = process.env.FRONTEND_URLS?.split(',') ?? [];
        const redirectUrl = frontendUrls[0];
        return res.redirect(`${redirectUrl}/login?error=Your+account+has+been+deactivated.+Please+contact+an+administrator.&code=account_deactivated`);
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
    
    // Create a single audit log for the login or signup
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: isNewAccount ? AuditLogActions.USER_CREATED : AuditLogActions.LOGIN_SUCCESS,
      performedBy: uid,
      details: {
        email,
        name,
        method: "google_oauth",
        accountSwitched: accountSwitched,
        originalUid: accountSwitched ? originalUid : undefined,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString()
      }
    });
  
    console.log("Redirecting to frontend...");
    const frontendUrls = process.env.FRONTEND_URLS?.split(',') ?? [];
    const redirectUrl = frontendUrls[0];
    res.redirect(`${redirectUrl}/dashboard?token=${newToken}`);
  } catch (err) {
    console.error("OAuth callback failed:", err);
    
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_FAILED,
      performedBy: uid || "unknown",
      details: {
        error: err.message,
        ipAddress,
        userAgent,
        method: "google_oauth_callback"
      },
      severity: LogSeverity.ERROR
    });
    
    return res.status(500).json({ error: "OAuth callback error" });
  }
};
