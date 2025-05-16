// src/controllers/emailController.js
import { google } from "googleapis";
import { db } from "../config/firebase.js";
import { oauthClient } from "../config/oauth.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

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
        tokenDoc = await db.collection("oauth_tokens").doc(userId).get();
        if (tokenDoc.exists) {
          ownerUid = userId;
          // Get the owner's email if possible
          const userData = await db.collection("users").doc(userId).get();
          if (userData.exists) {
            ownerEmail = userData.data().email || userId;
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
      // For regular users, just get their own token
      tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
      
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
    const userId = req.user.uid;
    
    // Get user's OAuth token
    const tokenDoc = await db.collection("oauth_tokens").doc(userId).get();
    
    if (!tokenDoc.exists || !tokenDoc.data()?.access_token) {
      return res.status(404).json({ error: "No Google token found for this user" });
    }
    
    const userData = tokenDoc.data();
    
    if (!userData.access_token) {
      console.log("No access token found for user:", userId);
      return res.status(400).json({ error: "No access token available" });
    }
    
    console.log("Found access token for user:", userId);
    
    // Set up Gmail API with user's token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userData.access_token });
    
    const gmail = google.gmail({ version: 'v1', auth });
    
    // Get folder/label from query params
    const folder = req.query.folder || 'INBOX';
    const label = req.query.label;
    
    console.log("Fetching from folder:", folder);
    if (label) console.log("With label:", label);
    
    // Determine which labels to use
    const labelIds = [folder];
    if (label && label !== folder) {
      labelIds.push(label);
    }
    
    const pageToken = req.query.pageToken || null;
    if (pageToken) console.log("Using page token:", pageToken);

    // Fetch messages from Gmail
    const { messages, nextPageToken } = await fetchMessagesFromFolder(
      gmail,
      labelIds,
      20,
      pageToken
    );
    
    console.log(`Found ${messages?.length || 0} messages`);
    
    if (!messages || messages.length === 0) {
      return res.json({ emails: [], nextPageToken: null });
    }

    // Fetch detailed metadata for each message
    const metadataPromises = messages.map((m) => fetchEmailMetadata(gmail, m.id));
    const detailedMessages = await Promise.all(metadataPromises);
    
    console.log(`Processed ${detailedMessages.length} detailed messages`);
    
    res.json({ emails: detailedMessages, nextPageToken });
  } catch (error) {
    console.error("Error in processing emails:", error);
    res.status(500).json({ error: "Error processing emails" });
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
