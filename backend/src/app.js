import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
<<<<<<< HEAD
import dashboardRoutes from "./routes/dashboardRoutes.js";
=======
import emailRoutes from "./routes/emailRoutes.js"; // ✅ Added Email Routes
import "./config/firebase.js"; // ✅ Initialize Firebase
>>>>>>> f4fc95d (email API integrated & report generation)

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
<<<<<<< HEAD
app.use("/api/dashboard", dashboardRoutes);
=======
app.use("/api/email", emailRoutes); // ✅ Added Email Routes
>>>>>>> f4fc95d (email API integrated & report generation)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
