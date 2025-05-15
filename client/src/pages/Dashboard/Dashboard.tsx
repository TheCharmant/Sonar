import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailList from "../../components/EmailList";
import EmailDetail from "../../components/EmailDetail";
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import { useAuth } from "../../context/AuthContext";
import type { EmailContent } from "../../components/EmailDetail";

const Dashboard = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();

  // Check for token in URL and in auth context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Remove token from URL to prevent it from being visible
      navigate("/dashboard", { replace: true });
    } else if (!token) {
      // If no token in URL and no token in context, redirect to login
      navigate("/");
    }
  }, [token, navigate, setToken]);

  const [view, setView] = useState<"inbox" | "sent" | "analytics">("inbox");
  const [currentScreen, setCurrentScreen] = useState<"list" | "detail">("list");
  const [selectedEmail, setSelectedEmail] = useState<EmailContent | null>(null);

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
          <button
            onClick={() => setView("analytics")}
            className={`px-4 py-2 rounded ${
              view === "analytics" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
            }`}
          >
            ANALYTICS
          </button>
        </div>
        <div>
          <a
            href="/settings"
            className="flex items-center text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </a>
        </div>
      </header>

      <main>
        {view === "analytics" ? (
          <AnalyticsDashboard />
        ) : currentScreen === "list" ? (
          <EmailList
            key={view}
            folder={view as "inbox" | "sent"}
            onSelectEmail={(email) => {
              setSelectedEmail(email);
              setCurrentScreen("detail");
            }}
          />
        ) : (
          <div className="h-screen">
            <div className="p-4">
              <button
                onClick={() => setCurrentScreen("list")}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to {view === "inbox" ? "Inbox" : "Sentbox"}
              </button>
            </div>
            <EmailDetail
              emailContent={selectedEmail}
              folder={view}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

