// src/controllers/emailController.js
import { google } from "googleapis";
import { db } from "../config/firebase.js";
import { oauthClient } from "../config/oauth.js";

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

  return {
    id: res.data.id,
    snippet: res.data.snippet,
    payload: {
      headers: res.data.payload.headers,
    },
  };
};

// Helper to fetch full email (for expansion)
export const fetchEmailDetail = async (req, res) => {
  try {
    const { id } = req.query;
    const uid = req.user.uid;

    if (!id) return res.status(400).json({ error: "Missing email ID" });

    const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
    if (!tokenDoc.exists) return res.status(404).json({ error: "No tokens found" });

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

    res.json({ email: { ...message, body: emailBody } });
  } catch (error) {
    console.error('Error fetching email details:', error);
    res.status(500).json({ error: 'Failed to fetch email details' });
  }
};


// Controller for /email/fetch (list view)
export const fetchEmails = async (req, res) => {
  const uid = req.user.uid;
  const tokenDoc = await db.collection("oauth_tokens").doc(uid).get();
  if (!tokenDoc.exists) return res.status(404).json({ error: "No tokens found" });

  oauthClient.setCredentials(tokenDoc.data());
  const gmail = google.gmail({ version: "v1", auth: oauthClient });

  const folderParam = req.query.folder?.toUpperCase();
  const allowedFolders = ["INBOX", "SENT"];
  if (!allowedFolders.includes(folderParam)) {
    return res.status(400).json({ error: "Invalid folder parameter" });
  }

  const pageToken = req.query.pageToken || null;

  try {
    const { messages, nextPageToken } = await fetchMessagesFromFolder(
      gmail,
      folderParam,
      20,
      pageToken
    );

    const metadataPromises = messages.map((m) => fetchEmailMetadata(gmail, m.id));
    const detailedMessages = await Promise.all(metadataPromises);

    res.json({ emails: detailedMessages, nextPageToken });
  } catch (error) {
    console.error("Error in fetching emails:", error);
    res.status(500).json({ error: "Error fetching emails" });
  }
};