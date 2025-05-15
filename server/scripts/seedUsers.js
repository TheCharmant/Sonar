import { db } from "../src/config/firebase.js";

const seedUsers = async () => {
  try {
    const usersRef = db.collection("users");
    
    // Check if we already have users
    const snapshot = await usersRef.get();
    if (!snapshot.empty) {
      console.log(`Database already has ${snapshot.size} users. Skipping seeding.`);
      return;
    }
    
    // Sample users to add
    const users = [
      {
        name: "Admin User",
        email: "admin@gmail.com",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        name: "Regular User",
        email: "user@gmail.com",
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        name: "Inactive User",
        email: "inactive@gmail.com",
        role: "user",
        status: "deleted",
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ];
    
    // Add users to Firestore
    for (const user of users) {
      await usersRef.add(user);
      console.log(`Added user: ${user.name} (${user.email})`);
    }
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

seedUsers();

export default seedUsers;