import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailList from "../components/EmailList";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"inbox" | "sent">("inbox");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      navigate("/dashboard", { replace: true });
    } else if (!token) {
      navigate("/");
    }
  }, [token, setToken, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-800 text-white px-6 py-4 text-xl font-semibold flex justify-between items-center">
        <div className="space-x-4">
          <button
            onClick={() => setView("inbox")}
            className={`px-4 py-2 rounded ${
              view === "inbox" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
            }`}
          >
            INBOX
          </button>
          <button
            onClick={() => setView("sent")}
            className={`px-4 py-2 rounded ${
              view === "sent" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
            }`}
          >
            SENTBOX
          </button>
        </div>
      </header>

      <main>
        <EmailList key={view} folder={view.toUpperCase() as "inbox" | "sent"} />
      </main>
    </div>
  );
};

export default Dashboard;
