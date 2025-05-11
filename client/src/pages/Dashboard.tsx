import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import { useAuth } from "../context/AuthContext";
import type { EmailContent } from "../components/EmailDetail";

const Dashboard = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"inbox" | "sent">("inbox");
  const [currentScreen, setCurrentScreen] = useState<"list" | "detail">("list");
  const [selectedEmail, setSelectedEmail] = useState<EmailContent | null>(null);

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
        {currentScreen === "list" ? (
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