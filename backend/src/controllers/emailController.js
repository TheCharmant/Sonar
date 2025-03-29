import auth from '../config/oauth.js';
import { google } from 'googleapis';

export const fetchEmails = async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth });

        // Fetch received emails
        const inboxResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['INBOX'],
        });

        // Fetch sent emails
        const sentResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['SENT'],
        });

        // Merge both lists, ensuring there are no duplicates
        const inboxMessages = inboxResponse.data.messages || [];
        const sentMessages = sentResponse.data.messages || [];
        const allEmails = [...inboxMessages, ...sentMessages];

        res.json({ success: true, emails: allEmails });
    } catch (error) {
        console.error("❌ Error fetching emails:", error);
        res.status(500).send("Error fetching emails.");
    }
};
