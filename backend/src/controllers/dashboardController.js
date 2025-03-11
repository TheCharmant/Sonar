import { db } from "../config/firebase.js";

// Get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const snapshot = await db.collection("dashboard").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update dashboard data
export const updateDashboardData = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;
        await db.collection("dashboard").doc(id).update(newData);
        res.status(200).json({ message: "Dashboard updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
