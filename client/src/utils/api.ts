const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getAuthUrl = async (uid: string) => {
  try {
    console.log("Getting auth URL with UID:", uid);
    console.log("Using BASE_URL:", BASE_URL);

    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error getting auth URL:", errorData);
      throw new Error(errorData.error || "Failed to get auth URL");
    }

    const data = await res.json();
    console.log("Received auth URL:", data.url);
    return data.url;
  } catch (error) {
    console.error("Error in getAuthUrl:", error);
    throw error;
  }
};

export const fetchEmails = async (token: string, folder: string = 'INBOX', label?: string, pageToken?: string) => {
  let url = `${BASE_URL}/email/fetch?folder=${folder}`;

  if (label) {
    url += `&label=${label}`;
  }

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
};

export const fetchGmailLabels = async (token: string) => {
  const res = await fetch(`${BASE_URL}/email/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch Gmail labels");
  return res.json();
};


