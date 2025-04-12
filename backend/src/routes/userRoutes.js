import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.post("/", userController.createUser); // optional
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.put("/:id/activate", userController.activateUser);
router.put("/:id/role", userController.changeUserRole);
router.delete("/:id", userController.softDeleteUser);

export default router;
