import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import auditLogRoutes from "./routes/auditlogRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();

// Allow multiple origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174'];

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

// Add this middleware before your routes to debug token issues
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('Received token:', token.substring(0, 15) + '...');
    
    // Try to decode without verification to see what's in the token
    try {
      const decoded = jwt.decode(token);
      console.log('Token payload:', JSON.stringify(decoded));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/user', userRoutes);
app.use("/api/auditlogs", auditLogRoutes);

// Add this after registering all routes
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      email: '/api/email',
      admin: '/api/admin',
      users: '/api/user',
      auditlogs: '/api/auditlogs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add a catch-all route to handle 404s
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

export default app;
