import { db } from "../config/firebase.js";

const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");
    
    // Check if users collection exists and has data
    const usersSnapshot = await db.collection("users").limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log("Creating sample users...");
      
      // Create admin user
      await db.collection("users").add({
        name: "Admin User",
        email: "admin@gmail.com",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      // Create regular user
      await db.collection("users").add({
        name: "Regular User",
        email: "user@gmail.com",
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      console.log("Sample users created successfully!");
    } else {
      console.log("Users collection already has data. Skipping initialization.");
    }
    
    // Check if auditLogs collection exists
    const logsSnapshot = await db.collection("auditLogs").limit(1).get();
    
    if (logsSnapshot.empty) {
      console.log("Creating auditLogs collection...");
      
      // Create a sample log entry
      await db.collection("auditLogs").add({
        user: "system",
        role: "system",
        type: "System",
        action: "Database Initialized",
        metadata: {},
        timestamp: new Date().toISOString()
      });
      
      console.log("AuditLogs collection created successfully!");
    } else {
      console.log("AuditLogs collection already exists. Skipping initialization.");
    }
    
    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// Run the initialization
initializeDatabase();