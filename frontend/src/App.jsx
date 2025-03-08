import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCommunication from "./pages/NewCommunication";
import SearchFilters from "./pages/Search";
import ReportsAnalysis from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import "./index.css";

function App() {
  const [user, setUser] = useState(null); // Simulating auth state

  return (
    <Router>
      {user ? (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-communication" element={<NewCommunication />} />
              <Route path="/search-filters" element={<SearchFilters />} />
              <Route path="/reports-analysis" element={<ReportsAnalysis />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
