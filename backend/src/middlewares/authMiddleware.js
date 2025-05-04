import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🔐 Verify JWT and attach UID to req.user
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contains uid
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: "Invalid token" });
    }
};

// 👮 Optional: Role-based middleware
export const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
