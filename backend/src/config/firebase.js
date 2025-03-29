import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in environment variables.");
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"));
    console.log("✅ Firebase Service Account: ", serviceAccount.project_id);
} catch (error) {
    console.error("❌ Failed to parse service account JSON:", error);
    process.exit(1);
}

// Initialize Firebase Admin SDK
initializeApp({ credential: cert(serviceAccount) });

// Initialize Firestore with settings
export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true }); // ✅ Prevents Firestore errors

// Initialize Firebase Auth
export const auth = getAuth();

<<<<<<< HEAD
console.log("🔥 Firebase initialized!");
=======
console.log("🔥 Firebase Admin Initialized!");
>>>>>>> f4fc95d (email API integrated & report generation)
