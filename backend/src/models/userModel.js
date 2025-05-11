import { db } from "../config/firebase.js";
import admin from "firebase-admin";

const usersRef = db.collection("users");

const usersCollection = db.collection("users");

export default usersRef;


export const createUser = async (uid, email, name) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ email, name });
  return { uid, email, name };
};

export const getUserById = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
};
