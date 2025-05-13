import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config(); // Load environment variables

const app = express();

// ✅ Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/admin", adminAuthRoutes);

export default app;
