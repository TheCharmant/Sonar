import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
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
}

interface UserEmails {
  uid: string;
  inbox: Email[];
  sent: Email[];
}

interface EmailContent {
  subject: string;
  from: string;
  body: string;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  // Add other env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
      const subjectHeader = message.payload.headers.find((h: any) => h.name === "Subject");
      const fromHeader = message.payload.headers.find((h: any) => h.name === "From");

      setSelectedEmailContent({
        subject: subjectHeader?.value || "No Subject",
        from: fromHeader?.value || "Unknown Sender",
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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">All User Emails (Admin View)</h1>

      {userEmails.map((user) => (
        <div key={user.uid} className="border rounded p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-3">UID: {user.uid}</h2>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Inbox</h3>
            {user.inbox.length === 0 ? (
              <p className="text-sm text-gray-500">No inbox emails</p>
            ) : (
              <ul className="space-y-2">
                {user.inbox.map((email, index) => {
                  const subject = email.payload.headers.find((h) => h.name === "Subject")?.value;
                  const from = email.payload.headers.find((h) => h.name === "From")?.value;
                  return (
                    <li key={`${user.uid}-inbox-${email.id}-${index}`} className="border-b pb-2">
                      <p className="font-semibold">{subject || "No Subject"}</p>
                      <p className="text-sm text-gray-600">From: {from}</p>
                      <p className="text-gray-700">{email.snippet}</p>
                      <button
                        onClick={() => fetchFullEmail(email.id)}
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        Expand
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Sent</h3>
            {user.sent.length === 0 ? (
              <p className="text-sm text-gray-500">No sent emails</p>
            ) : (
              <ul className="space-y-2">
                {user.sent.map((email, index) => {
                  const subject = email.payload.headers.find((h) => h.name === "Subject")?.value;
                  const to = email.payload.headers.find((h) => h.name === "To")?.value;
                  return (
                    <li key={`${user.uid}-sent-${email.id}-${index}`} className="border-b pb-2">
                      <p className="font-semibold">{subject || "No Subject"}</p>
                      <p className="text-sm text-gray-600">To: {to}</p>
                      <p className="text-gray-700">{email.snippet}</p>
                      <button
                        onClick={() => fetchFullEmail(email.id)}
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        Expand
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ))}

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
            <h2 className="text-xl font-bold mb-2">{selectedEmailContent.subject}</h2>
            <p className="text-sm text-gray-500 mb-4">From: {selectedEmailContent.from}</p>
            <div className="whitespace-pre-wrap text-gray-800 max-h-[60vh] overflow-y-auto">
              {selectedEmailContent.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailList;
