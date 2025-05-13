import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import EmailDetail from "./AdminEmailDetail";
// Types
interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPayload {
  headers: EmailHeader[];
}

interface Email {
  id: string;
  snippet: string;
  payload: EmailPayload;
  isUnread: boolean;
  labels: {
    id: string;
    name: string;
  }[];
  // Add new fields for communication type
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
}

interface UserEmails {
  uid: string;
  inbox: Email[];
  sent: Email[];
}

interface EmailContent {
  id: string;
  subject: string;
  from: string;
  date: string;
  to?: string;
  cc?: string;
  bcc?: string;
  body: string;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  // Add other env vars as needed
}


const AdminEmailList = () => {
  const { token } = useAuth();
  const [userEmails, setUserEmails] = useState<UserEmails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmailContent, setSelectedEmailContent] = useState<EmailContent | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAllEmails();
  }, [token]);

  const fetchAllEmails = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/email/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch all emails");
      }

      const data = await res.json();
      setUserEmails(data.users);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullEmail = async (messageId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/email/detail?id=${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch full email");
      }

      const { email: message } = await res.json();
      
      // Extract all required headers
      const subjectHeader = message.payload.headers.find((h: any) => h.name === "Subject");
      const fromHeader = message.payload.headers.find((h: any) => h.name === "From");
      const dateHeader = message.payload.headers.find((h: any) => h.name === "Date");
      const toHeader = message.payload.headers.find((h: any) => h.name === "To");
      const ccHeader = message.payload.headers.find((h: any) => h.name === "Cc");
      const bccHeader = message.payload.headers.find((h: any) => h.name === "Bcc");

      setSelectedEmailContent({
        id: message.id,
        subject: subjectHeader?.value || "No Subject",
        from: fromHeader?.value || "Unknown Sender",
        date: dateHeader?.value || new Date().toISOString(),
        to: toHeader?.value || "",
        cc: ccHeader?.value || "",
        bcc: bccHeader?.value || "",
        body: message.body || "No content",
      });

      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching full email:", err);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmailContent(null);
  };

  if (loading) return <p className="p-4">Loading all emails...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  // Flatten all emails into a single array with additional metadata
  const allEmails = userEmails.flatMap(user => [
    ...user.inbox.map(email => ({
      ...email,
      userId: user.uid,
      category: "INBOX"
    })),
    ...user.sent.map(email => ({
      ...email,
      userId: user.uid,
      category: "SENT"
    }))
  ]);

  // Add utility functions for date formatting and email categorization
  const formatDateToUTC = (dateStr: string): string => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      return date.toISOString(); // ISO format includes date and time with seconds in UTC
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      console.error("Error formatting display date:", e);
      return dateStr;
    }
  };

  const getCommunicationType = (email: any): string => {
    // Check for reply indicators in headers
    const references = email.payload.headers.find(h => h.name === "References")?.value;
    const inReplyTo = email.payload.headers.find(h => h.name === "In-Reply-To")?.value;
    
    if (inReplyTo || references) {
      return "Reply";
    }
    
    // Check if it's a forward (common subject prefixes)
    const subject = email.payload.headers.find(h => h.name === "Subject")?.value || "";
    if (subject.toLowerCase().startsWith("fw:") || subject.toLowerCase().startsWith("fwd:")) {
      return "Forward";
    }
    
    return "Original";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All User Emails (Admin View)</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Timestamp (UTC)</th>
              <th className="py-2 px-4 border text-left">Local Time</th>
              <th className="py-2 px-4 border text-left">User ID</th>
              <th className="py-2 px-4 border text-left">Direction</th>
              <th className="py-2 px-4 border text-left">Type</th>
              <th className="py-2 px-4 border text-left">Labels</th>
              <th className="py-2 px-4 border text-left">Snippet</th>
            </tr>
          </thead>
          <tbody>
            {allEmails.map((email, index) => {
              const dateHeader = email.payload.headers.find(h => h.name === "Date")?.value;
              const utcTimestamp = formatDateToUTC(dateHeader);
              const localTime = formatDisplayDate(dateHeader);
              const communicationType = getCommunicationType(email);
              
              // Determine email direction (incoming/outgoing)
              const direction = email.category === "SENT" ? "Outgoing" : "Incoming";
              
              return (
                <tr key={`${email.userId}-${email.category}-${email.id}-${index}`} 
                    className={`hover:bg-gray-50 ${email.isUnread ? 'font-semibold' : ''}`}>
                  <td className="py-2 px-4 border text-xs font-mono">{utcTimestamp}</td>
                  <td className="py-2 px-4 border">{localTime}</td>
                  <td className="py-2 px-4 border">{email.userId}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      direction === "Outgoing" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {direction}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {communicationType}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex flex-wrap gap-1">
                      {email.labels?.map(label => {
                        // Customize label colors based on type
                        let colorClass = "bg-blue-100 text-blue-800";
                        
                        if (label.name === "IMPORTANT") {
                          colorClass = "bg-red-100 text-red-800";
                        } else if (label.name === "STARRED") {
                          colorClass = "bg-yellow-100 text-yellow-800";
                        } else if (label.name === "UNREAD") {
                          colorClass = "bg-gray-100 text-gray-800";
                        } else if (label.name === "SPAM") {
                          colorClass = "bg-orange-100 text-orange-800";
                        }
                        
                        return (
                          <span 
                            key={label.id} 
                            className={`px-2 py-1 text-xs rounded-full ${colorClass}`}
                            title={label.id}
                          >
                            {label.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2 px-4 border">
                    <button 
                      onClick={() => fetchFullEmail(email.id)}
                      className="text-left hover:underline"
                    >
                      {email.snippet}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Email modal */}
      {modalOpen && selectedEmailContent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <EmailDetail 
              emailContent={selectedEmailContent}
              folder={email.category === "SENT" ? "sent" : "inbox"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailList;
