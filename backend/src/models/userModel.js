import { db } from "../config/firebase.js";
import admin from "firebase-admin";

const usersRef = db.collection("users");

const usersCollection = db.collection("users");

export default usersRef;

export const createUser = async (uid, email, fullName) => {
    const userData = {
        uid,
        email,
        fullName,
        createdAt: new Date(),
    };
    await usersCollection.doc(uid).set(userData);
    return userData;
};

export const getUserById = async (uid) => {
    const userDoc = await usersCollection.doc(uid).get();
    return userDoc.exists ? userDoc.data() : null;
};
