import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Inbox from "./pages/Inbox/Inbox";
import Sentbox from "./pages/Sentbox/Sentbox";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes with shared layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/sentbox" element={<Sentbox />} />
        </Route>
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;

