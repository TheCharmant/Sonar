import { db } from '../config/firebase.js';

export const createUser = async (uid, email, name) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.set({ email, name });
  return { uid, email, name };
};

export const getUserById = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
};