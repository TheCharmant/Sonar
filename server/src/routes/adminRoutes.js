import express from "express";
import { requireRole } from "../middlewares/requireRole.js";
import userController from "../controllers/userController.js";

const router = express.Router();

// Dashboard route
router.get("/dashboard", requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Admin dashboard data" });
});

// User management routes
router.get("/users", requireRole("admin"), userController.getAllUsers);
router.post("/users", requireRole("admin"), userController.createUser);
router.get("/users/:id", requireRole("admin"), userController.getUserById);
router.put("/users/:id", requireRole("admin"), userController.updateUser);
router.delete("/users/:id", requireRole("admin"), userController.softDeleteUser);

export default router;


