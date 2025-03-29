import { google } from 'googleapis';
import dotenv from 'dotenv';
import { db } from './firebase.js'; // Import Firestore

dotenv.config();

// Initialize OAuth2 client
const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'http://localhost:5000/api/email/callback'
);

// Generate OAuth URL
export const getAuthUrl = () => {
    const url = auth.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    console.log("🔗 Authorize this app by visiting:", url);
    return url;
};

// Function to exchange code for tokens and store them in Firestore
export const getTokens = async (code, uid) => {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    // ✅ Save tokens in Firestore
    await db.collection("oauth_tokens").doc(uid).set(tokens);
    console.log("✅ UID:", uid);

    return tokens;
};

// Function to retrieve tokens from Firestore
export const getStoredTokens = async (uid) => {
    const doc = await db.collection("oauth_tokens").doc(uid).get();
    if (!doc.exists) {
        console.error("❌ No stored OAuth tokens found for UID:", uid);
        return null;
    }
    return doc.data();
};

// Export the OAuth client
export default auth;

// 🚀 Log OAuth URL when server starts
getAuthUrl();
