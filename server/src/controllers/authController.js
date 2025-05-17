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


// Check if Gmail is connected for a user
export const checkGmailConnection = async (req, res) => {
  try {
    const uid = req.user.uid;
    console.log(`Checking Gmail connection for user: ${uid}`);

    // Check if the user has OAuth tokens stored
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();

    if (!tokenDoc.exists) {
      console.log(`No OAuth tokens found for user: ${uid}`);
      return res.json({ gmailConnected: false });
    }

    const tokenData = tokenDoc.data();

    // Check if the tokens include Gmail scope
    const hasGmailScope = tokenData.scope &&
      (tokenData.scope.includes('https://www.googleapis.com/auth/gmail.readonly') ||
       tokenData.scope.includes('https://mail.google.com/'));

    // Check if we have the Gmail email stored
    const hasGmailEmail = !!tokenData.gmail_email;

    // Consider Gmail connected if we have both scope and email
    const isConnected = hasGmailScope && hasGmailEmail;

    console.log(`Gmail connection status for user ${uid}: ${isConnected ? 'Connected' : 'Not connected'}`);

    return res.json({
      gmailConnected: isConnected,
      email: isConnected ? tokenData.gmail_email : null
    });
  } catch (error) {
    console.error("Error checking Gmail connection:", error);
    res.status(500).json({ error: "Failed to check Gmail connection status" });
  }
};

// Generate URL for connecting Gmail
export const connectGmail = async (req, res) => {
  try {
    const uid = req.user.uid;
    console.log(`Generating Gmail connection URL for user: ${uid}`);

    // Generate a state token that includes the user's UID
    const stateToken = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Get the authorization URL
    const authUrl = getAuthUrl(stateToken);

    // Log the attempt
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: "gmail_connection_initiated",
      performedBy: uid,
      details: {
        timestamp: new Date().toISOString()
      }
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating Gmail connection URL:", error);
    res.status(500).json({ error: "Failed to generate Gmail connection URL" });
  }
};

// Disconnect Gmail
export const disconnectGmail = async (req, res) => {
  try {
    const uid = req.user.uid;
    console.log(`Disconnecting Gmail for user: ${uid}`);

    // Check if the user has OAuth tokens stored
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();

    if (!tokenDoc.exists) {
      return res.status(404).json({ error: "No Gmail connection found" });
    }

    // Delete the OAuth tokens
    await db.collection("oauth_tokens").doc(uid).delete();

    // Log the disconnection
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: "gmail_disconnected",
      performedBy: uid,
      details: {
        timestamp: new Date().toISOString()
      }
    });

    res.json({ success: true, message: "Gmail disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    res.status(500).json({ error: "Failed to disconnect Gmail" });
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
    
    const newToken = jwt.sign(
      { 
        uid: uid,
        email: email,
        name: name || '',
        role: 'user'
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log("Generated new token:", newToken.substring(0, 10) + "...");

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

// Make sure this function is exported
export const validateToken = async (req, res) => {
  try {
    // If the request made it past the auth middleware, the token is valid
    // We can do additional checks here if needed
    
    // Check if the OAuth token is still valid
    const uid = req.user.uid;
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
    
    if (!tokenDoc.exists) {
      return res.status(401).json({ error: "OAuth token not found" });
    }
    
    const tokenData = tokenDoc.data();
    
    // Check if token is expired
    if (!tokenData.expiry_date || new Date().getTime() > tokenData.expiry_date) {
      // Try to refresh the token if we have a refresh token
      if (tokenData.refresh_token) {
        try {
          oauthClient.setCredentials({
            refresh_token: tokenData.refresh_token
          });
          
          const { tokens } = await oauthClient.refreshToken(tokenData.refresh_token);
          
          // Update token in database
          await db.collection("oauth_tokens").doc(uid).update({
            access_token: tokens.access_token,
            expiry_date: tokens.expiry_date
          });
          
          // Token refreshed successfully
          return res.status(200).json({ valid: true, refreshed: true });
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          return res.status(401).json({ error: "Failed to refresh token" });
        }
      } else {
        return res.status(401).json({ error: "Token expired and no refresh token available" });
      }
    }
    
    // Token is valid
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ error: "Failed to validate token" });
  }
};
