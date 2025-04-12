import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import auditlogRoutes from "./routes/auditlogRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import "./config/firebase.js"; // Initialize Firebase

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes); // Added Email Routes
app.use("/api/auditlog", auditlogRoutes);
app.use("/api/users", userRoutes);

export default app;