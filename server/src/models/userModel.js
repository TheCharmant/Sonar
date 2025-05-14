import admin from "firebase-admin";

const db = admin.firestore();
const usersRef = db.collection("users");

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
