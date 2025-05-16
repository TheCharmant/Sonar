// src/controllers/emailController.js
import { google } from "googleapis";
import { db } from "../config/firebase.js";
import { oauthClient } from "../config/oauth.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

const refreshTokenIfNeeded = async (uid) => {
  try {
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
    
    if (!tokenDoc.exists) return null;
    
    const tokenData = tokenDoc.data();
    
    // Check if token is expired or about to expire (5 min buffer)
    const isExpired = !tokenData.expiry_date || 
                      new Date().getTime() > tokenData.expiry_date - (5 * 60 * 1000);
    
    if (isExpired && tokenData.refresh_token) {
      console.log(`Token expired for user ${uid}, refreshing...`);
      
      // Set credentials and refresh
      oauthClient.setCredentials({
        refresh_token: tokenData.refresh_token
      });
      
      const { tokens } = await oauthClient.refreshToken(tokenData.refresh_token);
      
      // Update token in database
      await db.collection("oauth_tokens").doc(uid).update({
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date
      });
      
      return tokens;
    }
    
    return tokenData;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

// Fetch message IDs with optional pagination
const fetchMessagesFromFolder = async (gmail, folder, maxResults = 20, pageToken = null) => {
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: [folder],
    maxResults,
    pageToken,
  });

  return {
    messages: response.data.messages || [],
    nextPageToken: response.data.nextPageToken || null,
  };
};

// Helper to fetch metadata only
const fetchEmailMetadata = async (gmail, messageId) => {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["Subject", "From", "To", "Date"],
  });

  // Get the full message to check labels
  const fullMessage = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  // Include all labels from the message
  const labels = fullMessage.data.labelIds?.map(labelId => ({ id: labelId })) || [];

  return {
    id: res.data.id,
    snippet: res.data.snippet,
    payload: {
      headers: res.data.payload.headers,
      parts: res.data.payload.parts,
    },
    labels,
    isUnread: fullMessage.data.labelIds?.includes("UNREAD") || false,
  };
};

// Helper to fetch email detail (for expansion)
export const fetchEmailDetail = async (req, res) => {
  try {
    const { id } = req.query;
    const uid = req.user.uid;
    const userEmail = req.user.email || uid;

    if (!id) return res.status(400).json({ error: "Missing email ID" });

    // Check if the user is an admin
    const isAdmin = req.user.role === 'admin';
    
    // If admin, we need to determine which user's email we're fetching
    let tokenDoc;
    let ownerUid = uid;
    let ownerEmail = userEmail;
    
    if (isAdmin) {
      // For admins, we need to find which user owns this email
      // This could be passed as a query parameter
      const userId = req.query.userId;
      
      if (userId) {
        // If userId is provided, use that
        const refreshedTokens = await refreshTokenIfNeeded(userId);
        if (refreshedTokens) {
          tokenDoc = { exists: true, data: () => refreshedTokens };
          ownerUid = userId;
          // Get the owner's email if possible
          const userData = await db.collection("users").doc(userId).get();
          if (userData.exists) {
            ownerEmail = userData.data().email || userId;
          }
        } else {
          tokenDoc = await db.collection("oauth_tokens").doc(userId).get();
          if (tokenDoc.exists) {
            ownerUid = userId;
            // Get the owner's email if possible
            const userData = await db.collection("users").doc(userId).get();
            if (userData.exists) {
              ownerEmail = userData.data().email || userId;
            }
          }
        }
      } else {
        // Otherwise, try to find any user with this email
        // This is less efficient but works for demo purposes
        const tokenDocs = await db.collection("oauth_tokens").listDocuments();
        
        // Try each user's tokens until we find one that works
        for (const doc of tokenDocs) {
          const tempDoc = await doc.get();
          if (tempDoc.exists) {
            tokenDoc = tempDoc;
            ownerUid = doc.id;
            // Get the owner's email if possible
            const userData = await db.collection("users").doc(ownerUid).get();
            if (userData.exists) {
              ownerEmail = userData.data().email || ownerUid;
            }
            break;
          }
        }
      }
      
      // Log admin viewing user's email
      await createAuditLog({
        user: userEmail,
        role: "admin",
        type: AuditLogTypes.EMAIL,
        action: AuditLogActions.EMAIL_READ,
        metadata: {
          email_id: id,
          user_email: ownerEmail,
          user_id: ownerUid,
          admin_action: true
        }
      });
    } else {
      // For regular users, refresh their token if needed
      const refreshedTokens = await refreshTokenIfNeeded(uid);
      if (refreshedTokens) {
        tokenDoc = { exists: true, data: () => refreshedTokens };
      } else {
        tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
      }
      
      // Log user reading their own email
      await createAuditLog({
        user: userEmail,
        role: "user",
        type: AuditLogTypes.EMAIL,
        action: AuditLogActions.EMAIL_READ,
        metadata: {
          email_id: id
        }
      });
    }
    
    if (!tokenDoc || !tokenDoc.exists) {
      return res.status(404).json({ error: "No tokens found" });
    }

    const { access_token } = tokenDoc.data();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token });

    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: id.toString(),
    });

    const message = response.data;

    function extractBody(payload) {
      if (!payload) return '';

      if (payload.body && payload.body.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf8');
      }

      if (payload.parts && Array.isArray(payload.parts)) {
        for (const part of payload.parts) {
          const result = extractBody(part);
          if (result) return result;
        }
      }

      return '';
    }

    const emailBody = extractBody(message.payload);

    res.json({ 
      email: { ...message, body: emailBody },
      ownerUid // Include the owner's UID for reference
    });
  } catch (error) {
    console.error('Error fetching email details:', error);
    res.status(500).json({ error: 'Failed to fetch email details' });
  }
};

// Controller for /email/fetch (list view)
export const fetchEmails = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Try to refresh token if needed
    const refreshedTokens = await refreshTokenIfNeeded(uid);
    
    if (refreshedTokens) {
      // Use refreshed tokens
      oauthClient.setCredentials(refreshedTokens);
      const gmail = google.gmail({ version: "v1", auth: oauthClient });
      return await processEmailFetch(req, res, gmail);
    }
    
    // Original token retrieval logic
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
    
    if (!tokenDoc.exists) {
      // Check if user has a different UID in the system based on their Gmail account
      const userEmail = req.user.email;
      if (userEmail) {
        const existingTokensSnapshot = await db.collection("oauth_tokens")
          .where("gmail_email", "==", userEmail)
          .get();
        
        if (!existingTokensSnapshot.empty) {
          const existingDoc = existingTokensSnapshot.docs[0];
          // Use the existing token instead
          const tokenData = existingDoc.data();
          
          // Set up Gmail client with the found token
          const auth = new google.auth.OAuth2();
          auth.setCredentials({ access_token: tokenData.access_token });
          const gmail = google.gmail({ version: "v1", auth });
          
          // Continue with email fetching using this token
          return await processEmailFetch(req, res, gmail);
        }
      }
      
      return res.status(404).json({ error: "No tokens found" });
    }

    oauthClient.setCredentials(tokenDoc.data());
    const gmail = google.gmail({ version: "v1", auth: oauthClient });
    
    await processEmailFetch(req, res, gmail);
  } catch (error) {
    console.error("Error in fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

// Helper function to process email fetching
const processEmailFetch = async (req, res, gmail) => {
  // Get the folder or label to filter by
  const folderParam = req.query.folder?.toUpperCase();
  const labelParam = req.query.label;
  
  // Default allowed system folders
  const allowedFolders = ["INBOX", "SENT", "IMPORTANT", "STARRED", "DRAFT", "SPAM", "TRASH"];
  
  let labelIds = [];
  
  if (labelParam) {
    // If a specific label is requested, use that
    labelIds = [labelParam];
  } else if (allowedFolders.includes(folderParam)) {
    // Otherwise use the folder parameter
    labelIds = [folderParam];
  } else {
    // Default to INBOX if no valid folder is specified
    labelIds = ["INBOX"];
  }

  const pageToken = req.query.pageToken || null;

  try {
    const { messages, nextPageToken } = await fetchMessagesFromFolder(
      gmail,
      labelIds[0], // Using the first label/folder
      20,
      pageToken
    );

    const metadataPromises = messages.map((m) => fetchEmailMetadata(gmail, m.id));
    const detailedMessages = await Promise.all(metadataPromises);

    res.json({ emails: detailedMessages, nextPageToken });
  } catch (error) {
    console.error("Error in processing emails:", error);
    res.status(500).json({ error: "Error processing emails" });
  }
};

// Controller: /admin/email/all
export const fetchAllEmailsForAdmin = async (req, res) => {
  try {
    console.log("Starting fetchAllEmailsForAdmin");
    const tokenDocs = await db.collection("oauth_tokens").listDocuments();
    console.log(`Found ${tokenDocs.length} token documents`);

    // First, fetch all labels from all users to build a label map
    const labelMap = new Map();
    
    for (const docRef of tokenDocs) {
      try {
        const tokenSnap = await docRef.get();
        if (!tokenSnap.exists || !tokenSnap.data()?.access_token) continue;
        
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: tokenSnap.data().access_token });
        
        const gmail = google.gmail({ version: 'v1', auth });
        const labels = await fetchGmailLabels(gmail);
        
        // Add each label to our map (using ID as key)
        labels.forEach(label => {
          labelMap.set(label.id, {
            id: label.id,
            name: label.name,
            type: label.type,
            color: label.color || null
          });
        });
      } catch (err) {
        console.error(`Error fetching labels for user ${docRef.id}:`, err);
      }
    }

    const fetchUserEmails = async (docRef) => {
      try {
        const uid = docRef.id;
        console.log(`Processing user: ${uid}`);
        
        const tokenSnap = await docRef.get();
        if (!tokenSnap.exists) {
          console.log(`No token data for user: ${uid}`);
          return { uid, inbox: [], sent: [] };
        }
        
        const tokenData = tokenSnap.data();
        if (!tokenData?.access_token) {
          console.log(`No access token for user: ${uid}`);
          return { uid, inbox: [], sent: [] };
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: tokenData.access_token });
        
        const gmail = google.gmail({ version: 'v1', auth });

        const fetchForFolder = async (folder) => {
          try {
            console.log(`Fetching ${folder} for user: ${uid}`);
            const { messages } = await fetchMessagesFromFolder(gmail, folder, 10);
            console.log(`Found ${messages?.length || 0} messages in ${folder} for user: ${uid}`);
            
            if (!messages || messages.length === 0) {
              return [];
            }
            
            const metadata = await Promise.all(
              messages.map(async (msg) => {
                try {
                  const emailData = await fetchEmailMetadata(gmail, msg.id);
                  
                  // Enhance labels with full details from our label map
                  if (emailData.labels && emailData.labels.length > 0) {
                    emailData.labels = emailData.labels.map(label => {
                      const fullLabel = labelMap.get(label.id);
                      return fullLabel || { id: label, name: label };
                    });
                  }
                  
                  return emailData;
                } catch (err) {
                  console.error(`Error fetching metadata for message ${msg.id}:`, err);
                  return null;
                }
              })
            );
            
            return metadata.filter(item => item !== null);
          } catch (err) {
            console.error(`Failed to fetch for UID ${uid} in folder ${folder}:`, err);
            return [];
          }
        };

        const inboxEmails = await fetchForFolder("INBOX");
        const sentEmails = await fetchForFolder("SENT");

        return {
          uid,
          inbox: inboxEmails,
          sent: sentEmails,
        };
      } catch (err) {
        console.error(`Error processing user ${docRef.id}:`, err);
        return { uid: docRef.id, inbox: [], sent: [] };
      }
    };

    // Fetch emails for all users concurrently
    const userEmails = await Promise.all(
      tokenDocs.map(docRef => fetchUserEmails(docRef).catch(err => {
        console.error(`Unhandled error for user ${docRef.id}:`, err);
        return { uid: docRef.id, inbox: [], sent: [] };
      }))
    );

    console.log(`Successfully processed ${userEmails.length} users`);
    res.json({ users: userEmails });
  } catch (error) {
    console.error("Admin email fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch emails for all users" });
  }
};

// Helper to fetch all Gmail labels for a user
const fetchGmailLabels = async (gmail) => {
  try {
    const response = await gmail.users.labels.list({
      userId: 'me'
    });
    
    return response.data.labels || [];
  } catch (error) {
    console.error('Error fetching Gmail labels:', error);
    return [];
  }
};

// New controller to fetch user's Gmail labels
export const getUserLabels = async (req, res) => {
  try {
    const uid = req.user.uid;
    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
    
    if (!tokenDoc.exists) {
      return res.status(404).json({ error: "No tokens found" });
    }
    
    const { access_token } = tokenDoc.data();
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token });
    
    const gmail = google.gmail({ version: 'v1', auth });
    
    const labels = await fetchGmailLabels(gmail);
    
    // Return both system labels (INBOX, SENT, etc.) and user-created labels
    res.json({ 
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        type: label.type, // 'system' or 'user'
        messageListVisibility: label.messageListVisibility,
        labelListVisibility: label.labelListVisibility,
        // Include color information if available
        color: label.color || null
      }))
    });
  } catch (error) {
    console.error('Error fetching user labels:', error);
    res.status(500).json({ error: 'Failed to fetch Gmail labels' });
  }
};
