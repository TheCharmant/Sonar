import { google } from "googleapis";

export const getEmails = async (accessToken) => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });
    const { data } = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

    const emails = await Promise.all(
      (data.messages || []).map(msg =>
        gmail.users.messages.get({ userId: "me", id: msg.id, format: "metadata", metadataHeaders: ["From", "Subject", "Date"] })
          .then(res => res.data)
      )
    );

    return { success: true, emails };
  } catch (error) {
    return { success: false, emails: [] };
  }
};
