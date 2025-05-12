import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors'; // Add cors
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config(); // Load environment variables

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Adjust if your frontend is on a different port
  methods: 'GET,POST,PUT,DELETE', // Allow the necessary HTTP methods
  credentials: true, // Allow credentials (cookies, etc.)
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/admin", adminAuthRoutes);

export default app;