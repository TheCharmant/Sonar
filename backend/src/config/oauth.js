import { google } from 'googleapis';
import dotenv from 'dotenv';
import { db } from './firebase.js'; // Firestore
import fetch from 'node-fetch'; // Required to fetch user info from Google

dotenv.config();

// Initialize OAuth2 client
const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID, // Client ID from Google Developer Console
    process.env.CLIENT_SECRET, // Client secret from Google Developer Console
    'http://localhost:5000/api/email/callback' // Redirect URI
);

// 🔗 Generate OAuth URL
export const getAuthUrl = (stateToken) => {
    const url = auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        state: stateToken  // ✅ Pass JWT here
    });
    return url;
};


// 🔄 Exchange code for tokens & store them
export const getTokens = async (code) => {
    try {
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens); // Save credentials in OAuth2 client
        return tokens; // Return tokens for further use
    } catch (error) {
        console.error("❌ Error during token exchange:", error);
        throw new Error("Failed to exchange code for tokens.");
    }
};

// 🧠 Fetch Google user info using access token
export const getGoogleUserInfo = async (accessToken) => {
    try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}` // Send the access token for authentication
            }
        });
        if (!res.ok) throw new Error("❌ Failed to fetch Google user info");
        return await res.json(); // Returns user data like email, name, and ID
    } catch (error) {
        console.error("❌ Error fetching Google user info:", error);
        throw new Error("Failed to fetch Google user info.");
    }
};

// ✅ Store tokens in Firestore
export const saveOAuthTokens = async (uid, tokens) => {
    try {
        await db.collection("oauth_tokens").doc(uid).set(tokens); // Save tokens under user's UID
        console.log("🔐 Tokens saved for UID:", uid);
    } catch (error) {
        console.error("❌ Error saving OAuth tokens:", error);
        throw new Error("Failed to save OAuth tokens in Firestore.");
    }
};

// 🗂 Retrieve tokens from Firestore
export const getStoredTokens = async (uid) => {
    try {
        const doc = await db.collection("oauth_tokens").doc(uid).get();
        if (!doc.exists) {
            console.error("❌ No stored OAuth tokens found for UID:", uid);
            return null; // No tokens found for user
        }
        return doc.data(); // Return stored tokens
    } catch (error) {
        console.error("❌ Error retrieving stored tokens:", error);
        throw new Error("Failed to retrieve OAuth tokens from Firestore.");
    }
};

export default auth;
