import { auth, db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const createAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "Admin123!";
    
    console.log(`Creating admin user with email: ${email}`);
    
    // Check if user already exists
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log(`User already exists with UID: ${userRecord.uid}`);
      
      // Update user role in Firestore
      await db.collection("users").doc(userRecord.uid).set({
        email: email,
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log(`Updated user role to admin`);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // User doesn't exist, continue with creation
    }
    
    // Create user
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true
    });
    
    console.log(`User created with UID: ${userRecord.uid}`);
    
    // Add to users collection with admin role
    await db.collection("users").doc(userRecord.uid).set({
      email: email,
      role: "admin",
      createdAt: new Date().toISOString()
    });
    
    console.log(`Added user to users collection with admin role`);
    console.log(`Admin user created successfully!`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Run the function
createAdminUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

