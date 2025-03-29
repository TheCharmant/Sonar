export const generateEmailReport = async (emails) => {
    try {
        // If no emails were provided
        if (!emails || emails.length === 0) {
            throw new Error("No emails to generate report.");
        }

        // Initialize report data
        let unreadEmails = 0;
        let readEmails = 0;
        const emailsBySender = {};
        const emailsByReceiver = {};
        const emailsByDate = {};
        const timeSentVsReceived = [];
        const senderFrequency = {};
        const engagementData = { mostReadEmails: [], emailResponseTimes: [] };
        const emailThreads = [];

        // Process each email
        emails.forEach((email) => {
            // Email Status (Unread/Read)
            if (email.status === "Unread") unreadEmails++;
            else readEmails++;

            // Emails by Sender
            if (!emailsBySender[email.sender]) emailsBySender[email.sender] = 0;
            emailsBySender[email.sender]++;

            // Emails by Receiver
            if (!emailsByReceiver[email.receiver]) emailsByReceiver[email.receiver] = 0;
            emailsByReceiver[email.receiver]++;

            // Emails by Date/Time
            const date = email.date_sent; // Assuming date is in 'MM/DD/YYYY' format
            if (!emailsByDate[date]) emailsByDate[date] = { sent: 0, received: 0 };
            if (email.status === "Sent") emailsByDate[date].sent++;
            else emailsByDate[date].received++;

            // Time Sent and Time Received Report (comparison)
            const timeDifference = Math.abs(new Date(email.date_sent) - new Date(email.date_received));
            timeSentVsReceived.push(timeDifference);

            // Sender Frequency Report (how many emails per sender)
            if (!senderFrequency[email.sender]) senderFrequency[email.sender] = 0;
            senderFrequency[email.sender]++;

            // Email Engagement (Most Read Emails, Email Response Time)
            engagementData.mostReadEmails.push({
                sender: email.sender,
                subject: email.subject,
                body_preview: email.body,
                readTime: timeDifference, // Assuming time to read is equivalent to response time
            });

            // Calculating email response time
            const responseTime = Math.abs(new Date(email.date_sent) - new Date(email.date_received));
            engagementData.emailResponseTimes.push({
                sender: email.sender,
                responseTime: responseTime,
            });

            // Email threading (example, assuming "thread_id" or similar exists)
            if (email.thread_id) {
                const existingThread = emailThreads.find((thread) => thread.thread_id === email.thread_id);
                if (existingThread) {
                    existingThread.emails_in_thread++;
                } else {
                    emailThreads.push({
                        thread_id: email.thread_id,
                        emails_in_thread: 1,
                        subject: email.subject,
                    });
                }
            }
        });

        // Get the timestamp for when the report was generated
        const timestamp = new Date().toISOString(); // This will give you an ISO 8601 format timestamp

        // Generate the report
        const report = {
            General_Email_Activity_Report: {
                generated_at: timestamp,
                Total_Number_of_Emails: {
                    Sent_and_Received: emails.length,
                },
                Unread_Emails: unreadEmails,
                Read_Emails: readEmails
            },
            Sender_Report: {
                Sender_Emails: emailsBySender,
                Top_Senders: Object.keys(senderFrequency)
                    .map((sender) => ({
                        sender: sender,
                        email_count: senderFrequency[sender],
                    }))
                    .sort((a, b) => b.email_count - a.email_count)
                    .slice(0, 3), // Limit to top 3 senders
            },
            Receiver_Report: {
                Receiver_Emails: emailsByReceiver,
                Top_Receiver: {
                    receiver: Object.keys(emailsByReceiver)
                        .reduce((a, b) => (emailsByReceiver[a] > emailsByReceiver[b] ? a : b)),
                    email_count: Math.max(...Object.values(emailsByReceiver)),
                },
            },
            Date_and_Time_Based_Report: {
                // Simplified to just one field with sent and received counts for each date
                Emails_Sent_and_Received_by_Date: emailsByDate,
            },
            Subject_and_Content_Report: {
                Emails_Categorized_by_Subject: categorizeEmailsBySubject(emails),
                Top_Email_Subjects: Object.keys(categorizeEmailsBySubject(emails))
                    .map((subject) => ({
                        subject: subject,
                        email_count: categorizeEmailsBySubject(emails)[subject],
                    }))
                    .sort((a, b) => b.email_count - a.email_count)
                    .slice(0, 3),
            },
            User_Interaction_Report: {
                Emails_Opened_vs_Not_Opened: {
                    opened: readEmails,
                    not_opened: unreadEmails,
                },
                Emails_with_Attachments: emails.filter((email) => email.has_attachment).length,
            },
            Security_and_Compliance_Report: {
                Security_Alerts: emails.filter((email) => email.is_security_alert).map((email) => ({
                    email_subject: email.subject,
                    alert_type: email.alert_type,
                    message: email.message,
                })),
            },
            Email_Chain_Threading_Report: {
                Email_Threaded_Discussions: emailThreads,
            },
        };

        // Return the generated report
        return { success: true, report };
    } catch (error) {
        console.error("❌ Error generating email report:", error);
        throw new Error("Failed to generate email report.");
    }
};

// Helper function to categorize emails by subject
const categorizeEmailsBySubject = (emails) => {
    const subjectMap = {};
    emails.forEach((email) => {
        if (!subjectMap[email.subject]) subjectMap[email.subject] = 0;
        subjectMap[email.subject]++;
    });
    return subjectMap;
};
