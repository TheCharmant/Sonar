// Function to fetch emails from the Gmail API
export const getEmails = async (token: string, folder: 'inbox' | 'sent'): Promise<any[]> => {
  try {
    console.log(`Fetching emails from ${folder} folder`);

    // For testing purposes, return mock data if no token is provided
    if (!token) {
      console.log('No token provided, returning mock data');
      return getMockEmails(folder);
    }

    // For direct access to Gmail API, use the Gmail API endpoint
    const labelId = folder === 'inbox' ? 'INBOX' : 'SENT';

    // Try different approaches to get emails

    // First approach: Use Gmail API directly
    try {
      const url = `https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}&maxResults=50`;
      console.log(`Fetching emails from URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Received response for ${folder} folder:`, data);

        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          console.log(`Found ${data.messages.length} messages in ${folder} folder`);

          // Fetch full details for each email
          const emails = await Promise.all(
            data.messages.map(async (message: { id: string }, index: number) => {
              console.log(`Fetching details for email ${index + 1}/${data.messages.length} (ID: ${message.id})`);

              const detailUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
              const detailResponse = await fetch(detailUrl, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });

              if (!detailResponse.ok) {
                console.error(`Failed to fetch email details for ${message.id}: ${detailResponse.status} ${detailResponse.statusText}`);
                return null;
              }

              const emailData = await detailResponse.json();
              console.log(`Successfully fetched details for email ${index + 1} (ID: ${message.id})`);
              return emailData;
            })
          );

          // Filter out any null values from failed requests
          const validEmails = emails.filter(email => email !== null);
          console.log(`Successfully fetched ${validEmails.length} emails from ${folder} folder`);

          if (validEmails.length > 0) {
            return validEmails;
          }
        }
      }
    } catch (apiError) {
      console.error('Error using Gmail API directly:', apiError);
    }

    // Second approach: Try to get emails from localStorage (if the app has stored them)
    try {
      const storedEmails = localStorage.getItem(`${folder}Emails`);
      if (storedEmails) {
        const parsedEmails = JSON.parse(storedEmails);
        if (Array.isArray(parsedEmails) && parsedEmails.length > 0) {
          console.log(`Found ${parsedEmails.length} emails in localStorage for ${folder} folder`);
          return parsedEmails;
        }
      }
    } catch (storageError) {
      console.error('Error retrieving emails from localStorage:', storageError);
    }

    // If we get here, both approaches failed, use mock data as last resort
    console.log(`Could not fetch real emails for ${folder} folder, using mock data`);
    return getMockEmails(folder);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
};

// Function to generate mock emails for testing
const getMockEmails = (folder: 'inbox' | 'sent'): any[] => {
  console.log(`Generating mock emails for ${folder} folder`);

  // Create a base date for the emails
  const now = new Date();

  // Generate different numbers of emails for inbox and sent
  const count = folder === 'inbox' ? 10 : 5;

  // Generate mock emails
  const emails = Array.from({ length: count }, (_, i) => {
    // Create a date for this email (spread over the last month)
    const emailDate = new Date(now);
    emailDate.setDate(now.getDate() - Math.floor(Math.random() * 30));

    // Create a unique ID
    const id = `mock-${folder}-${i}-${Date.now()}`;

    // Create a thread ID (some sent emails will share thread IDs with inbox emails)
    const threadId = i < 3 && folder === 'sent' ? `mock-inbox-${i}-thread` : `mock-${folder}-${i}-thread`;

    // Create a subject (some sent emails will have Re: prefix)
    const subject = folder === 'sent' && i < 3 ? `Re: Test Email ${i}` : `Test Email ${i}`;

    // Create from and to addresses
    const from = folder === 'inbox' ? 'sender@example.com' : 'me@example.com';
    const to = folder === 'inbox' ? 'me@example.com' : 'recipient@example.com';

    return {
      id,
      threadId,
      snippet: `This is a snippet for test email ${i}`,
      payload: {
        headers: [
          { name: 'Subject', value: subject },
          { name: 'From', value: from },
          { name: 'To', value: to },
          { name: 'Date', value: emailDate.toISOString() }
        ],
        body: {
          data: 'VGhpcyBpcyBhIHRlc3QgZW1haWwgYm9keQ==' // "This is a test email body" in base64
        }
      }
    };
  });

  console.log(`Generated ${emails.length} mock emails for ${folder} folder`);
  return emails;
<<<<<<< HEAD
};
=======
};
>>>>>>> 2cf35c51c88c70b47be69f35d6637dec0954b75d
