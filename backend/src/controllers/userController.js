import usersRef from "../models/userModel.js";

// CREATE - This is optional if you're using Firebase Auth registration
const createUser = async (req, res) => {
  try {
    const { name, email, role = "user", status = "active" } = req.body;

    const newUser = { name, email, role, status, createdAt: new Date().toISOString() };
    const docRef = await usersRef.add(newUser);

    res.status(201).json({ id: docRef.id, ...newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ - Get all users (excluding soft-deleted)
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await usersRef.where("status", "!=", "deleted").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ - Single user
const getUserById = async (req, res) => {
  try {
    const doc = await usersRef.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE - Edit user info
const updateUser = async (req, res) => {
  try {
    await usersRef.doc(req.params.id).update(req.body);
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE (Soft) - Mark user as inactive/deleted
const softDeleteUser = async (req, res) => {
  try {
    await usersRef.doc(req.params.id).update({ status: "deleted" });
    res.status(200).json({ message: "User soft-deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ACTIVATE - Reactivate user
const activateUser = async (req, res) => {
  try {
    await usersRef.doc(req.params.id).update({ status: "active" });
    res.status(200).json({ message: "User activated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHANGE ROLE
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    await usersRef.doc(req.params.id).update({ role });
    res.status(200).json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  activateUser,
  changeUserRole,
};
