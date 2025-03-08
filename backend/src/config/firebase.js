import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
);

// Initialize Firebase Admin SDK
initializeApp({ credential: cert(serviceAccount) });

export const db = getFirestore();
export const auth = getAuth();

console.log("🔥 Firebase initialized!");
