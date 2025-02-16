import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// Initialize Firebase
initializeApp({ credential: cert(JSON.parse(fs.readFileSync("serviceAccount.json", "utf8"))) });
const db = getFirestore();
console.log("🔥 Firebase connected!");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Routes
app.get("/", (req, res) => res.json({ message: "Welcome to Soñar API!" }));
app.get("/welcomemessage", (req, res) => res.json({ message: "Welcome to Soñar Backend API!" }));

app.post("/addmessage", async (req, res) => {
  try {
    if (!req.body.text) return res.status(400).json({ success: false, error: "Text is required!" });

    const docRef = await db.collection("messages").add({ text: req.body.text, timestamp: new Date() });
    res.json({ success: true, id: docRef.id, message: "Message added to Firestore!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const snapshot = await db.collection("messages").orderBy("timestamp", "desc").get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/deletemessage/:id", async (req, res) => {
  try {
    await db.collection("messages").doc(req.params.id).delete();
    res.json({ success: true, message: `Message with ID ${req.params.id} deleted successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
