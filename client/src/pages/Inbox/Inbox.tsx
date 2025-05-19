import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailList from "../../components/EmailList/EmailList";
import EmailDetail from "../../components/EmailDetail/EmailDetail";
import { useAuth } from "../../context/AuthContext";
import type { EmailContent } from "../../components/EmailDetail/EmailDetail";
import "./Inbox.css";

const Inbox = () => {
  useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"list" | "detail">("list");
  const [selectedEmail, setSelectedEmail] = useState<EmailContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle token error
  const handleTokenError = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* Main Content */}
      <div className="email-header">
        <h1 className="page-title">Inbox</h1>
        <div className="search-container">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      ) : currentScreen === "list" ? (
        <>
          <EmailList
            folder="inbox"
            onSelectEmail={(email) => {
              setSelectedEmail(email);
              setCurrentScreen("detail");
            }}
            onError={(errorMsg) => {
              if (errorMsg.includes("unauthorized") || errorMsg.includes("token")) {
                handleTokenError();
              } else {
                setError(errorMsg);
              }
            }}
            searchTerm={searchTerm}
          />
        </>
      ) : (
        <div className="email-detail-container">
          <div className="back-button-container">
            <button
              onClick={() => setCurrentScreen("list")}
              className="back-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
          <EmailDetail
            emailContent={selectedEmail}
            folder="inbox"
          />
        </div>
      )}
    </>
  );
};

export default Inbox;
