import admin from "firebase-admin";

const db = admin.firestore();
const usersRef = db.collection("users");

export default usersRef;


export const createUser = async (uid, email, name, additionalData = {}) => {
  const userRef = db.collection("users").doc(uid);
  const userData = {
    email, 
    name,
    role: additionalData.role || "user",
    status: additionalData.status || "active",
    createdAt: additionalData.createdAt || new Date().toISOString(),
    ...additionalData
  };
  await userRef.set(userData);
  return { uid, ...userData };
};

export const getUserById = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
};
