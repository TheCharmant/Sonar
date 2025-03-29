import { google } from 'googleapis';
import { db } from '../config/firebase.js';
import { generateEmailReport } from './reportService.js';

// ✅ Get authenticated Google client
const getAuthClient = async (uid) => {
    const doc = await db.collection("oauth_tokens").doc(uid).get();
    if (!doc.exists) throw new Error("No OAuth tokens found for this user.");

    let tokens = doc.data();
    const auth = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI // ✅ Securely stored in .env
    );

    auth.setCredentials(tokens);

    // ✅ Auto-refresh expired tokens
    if (tokens.expiry_date < Date.now()) {
        console.log("🔄 Token expired, refreshing...");
        try {
            const { credentials } = await auth.refreshAccessToken();
            auth.setCredentials(credentials);

            // ✅ Update Firestore with refreshed tokens
            await db.collection("oauth_tokens").doc(uid).update(credentials);
            console.log("✅ Token refreshed & saved!");
        } catch (error) {
            console.error("❌ Failed to refresh token:", error);
            throw new Error("Token refresh failed. Re-authentication needed.");
        }
    }

    return auth;
};

// ✅ Fetch Full Email Details and Send to Report Service
export const getEmails = async (uid) => {
    try {
        const auth = await getAuthClient(uid);
        const gmail = google.gmail({ version: 'v1', auth });

        // Fetch received (INBOX) emails
        const inboxResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10, // Get latest 10 emails
            labelIds: ['INBOX'], // Fetch only inbox messages
        });

        // Fetch sent (SENT) emails
        const sentResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10, // Get latest 10 emails
            labelIds: ['SENT'], // Fetch only sent messages
        });

        // If no messages are found in both inbox and sent emails
        if (!inboxResponse.data.messages && !sentResponse.data.messages) {
            return { success: true, emails: [] };
        }

        // Combine inbox and sent emails
        const allMessages = [
            ...(inboxResponse.data.messages || []),
            ...(sentResponse.data.messages || [])
        ];

        // Fetch full details of each email
        const emails = await Promise.all(allMessages.map(async (msg) => {
            const email = await gmail.users.messages.get({ userId: 'me', id: msg.id });

            const payload = email.data.payload;
            let body = "";
            let to = "Unknown Receiver";
            let status = "Unread"; // Default to "Unread" (you could customize this based on labels)

            // Extract "To" field from headers (Receiver)
            const toHeader = payload.headers.find(header => header.name === "To");
            if (toHeader) {
                to = toHeader.value;
            }

            // Extract "Subject" from headers
            const subject = payload.headers.find(header => header.name === "Subject")?.value || "No Subject";

            // Extract "From" field from headers (Sender)
            const from = payload.headers.find(header => header.name === "From")?.value || "Unknown Sender";

            // Extract "Date" field from headers (Date Sent)
            const dateSent = payload.headers.find(header => header.name === "Date")?.value || "Unknown Date";

            // Convert the full date string to a Date object
            const date = new Date(dateSent);
            const formattedDate = date.toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }); // "Feb 01, 2020"
            const formattedTime = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }); // "01:10 PM"

            // Set Date Received as Date Sent
            const dateReceived = formattedDate;

            // Check if email parts contain body text
            if (payload.parts) {
                const part = payload.parts.find(p => p.mimeType === "text/plain") || payload.parts.find(p => p.mimeType === "text/html");
                if (part?.body?.data) {
                    body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            } else if (payload.body?.data) {
                body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }

            // Extract message preview (short snippet of body)
            const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;

            // Determine email status (Unread if it hasn't been opened)
            const labelIds = email.data.labelIds;
            if (labelIds && labelIds.includes("UNREAD")) {
                status = "Unread";
            } else {
                status = "Read";
            }

            // Return the email with custom fields
            return {
                sender: from,       // Sender
                receiver: to,       // Receiver
                subject,            // Subject
                date_sent: formattedDate, // Date Sent (e.g., "Feb 01, 2020")
                time_sent: formattedTime, // Time Sent (e.g., "01:10 PM")
                date_received: dateReceived, // Date Received (same as Date Sent)
                time_received: formattedTime, // Time Received (same as Time Sent)
                status,             // Status (Unread by default)
                body: preview,      // Message preview (first 100 characters)
                has_attachment: payload.parts && payload.parts.some(part => part.mimeType === 'application/octet-stream'),
                is_security_alert: false, // Assume false unless defined otherwise
                thread_id: email.data.threadId,
            };
        }));

        // Send the email data to the report service
        await generateEmailReport(emails);

        return { success: true, emails };
    } catch (error) {
        console.error("❌ Error fetching emails:", error);
        throw new Error("Failed to fetch emails.");
    }
};