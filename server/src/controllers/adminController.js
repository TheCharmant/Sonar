export const getAdminDashboard = (req, res) => {
  const { uid, role } = req.user;

  return res.status(200).json({
    message: "Welcome to the admin dashboard!",
    uid,
    role,
  });
};
