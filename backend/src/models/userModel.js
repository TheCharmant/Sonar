import { db } from "../config/firebase.js";

const usersCollection = db.collection("users");

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
