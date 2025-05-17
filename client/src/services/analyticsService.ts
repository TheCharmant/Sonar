// @ts-ignore
import { getEmails } from './emailService';

export interface EmailAnalytics {
  totalMessagesReceived: number;
  messagesSent: number;
  pendingMessages: number;
  responseTimeAverage: number; // in hours
  messageVolumeOverTime: {
    weeks: string[];
    received: number[];
    sent: number[];
  };
  responseRateDistribution: {
    replied: number;
    pending: number;
    ignored: number;
  };
  topCommunicationChannels: {
    email: number;
    sms: number;
    inApp: number;
  };
}

// Helper function to calculate the difference between two dates in hours
const getHoursDifference = (date1: Date, date2: Date): number => {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  return diffInMs / (1000 * 60 * 60);
};

// Helper function to get the week number for a date (not used but kept for reference)
// const getWeekNumber = (date: Date): number => {
//   const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
//   const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
//   return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
// };

// Function to get the start of the current month
const getStartOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Function to get the start date for each of the last 4 weeks
const getLastFourWeekStartDates = (): Date[] => {
  const now = new Date();
  const result: Date[] = [];

  for (let i = 0; i < 4; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (i * 7));
    // Set to start of the week (Sunday)
    date.setDate(date.getDate() - date.getDay());
    result.unshift(date); // Add to beginning of array
  }

  return result;
};

// Helper function to calculate emails per week
const calculateEmailsByWeek = (emails: any[], weekStartDates: Date[]): number[] => {
  console.log(`Calculating emails per week for ${emails.length} emails across ${weekStartDates.length} weeks`);
  console.log('Week start dates:', weekStartDates.map(d => d.toISOString()));

  const result = Array(weekStartDates.length).fill(0);

  // Create week end dates (each end date is the start of the next week, except for the last week)
  const weekEndDates = [...weekStartDates.slice(1), new Date()];

  // Log week ranges for debugging
  weekStartDates.forEach((startDate, index) => {
    const endDate = weekEndDates[index];
    console.log(`Week ${index + 1}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  });

  // Count emails per week
  emails.forEach((email, emailIndex) => {
    const dateHeader = email.payload.headers.find((h: any) => h.name === 'Date')?.value;
    if (!dateHeader) {
      console.log(`Email ${emailIndex} has no date header`);
      return;
    }

    const emailDate = new Date(dateHeader);
    console.log(`Email ${emailIndex} date: ${emailDate.toISOString()}`);

    let assigned = false;

    for (let i = 0; i < weekStartDates.length; i++) {
      if (emailDate >= weekStartDates[i] && emailDate < weekEndDates[i]) {
        result[i]++;
        console.log(`Email ${emailIndex} assigned to week ${i + 1}`);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      console.log(`Email ${emailIndex} not assigned to any week`);
    }
  });

  console.log('Emails per week:', result);
  return result;
};

// Helper function to calculate average response time
const calculateAverageResponseTime = (inboxEmails: any[], sentEmails: any[]): number => {
  console.log('Calculating average response time');

  // If we don't have enough data, return a reasonable default
  if (inboxEmails.length === 0 || sentEmails.length === 0) {
    console.log('Not enough emails to calculate response time, using default');
    return 2.5;
  }

  // Try to match sent emails to inbox emails by thread ID and subject
  const matchedPairs: { received: Date, sent: Date }[] = [];

  // For each sent email, try to find a matching received email
  sentEmails.forEach((sentEmail: any) => {
    const sentDate = new Date(sentEmail.payload.headers.find((h: any) => h.name === 'Date')?.value || '');
    const sentThreadId = sentEmail.threadId;
    const sentSubject = sentEmail.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
    const normalizedSentSubject = sentSubject.replace(/^Re:\s*/i, '');

    // First try to match by thread ID
    const matchedByThreadId = inboxEmails.find((inboxEmail: any) =>
      inboxEmail.threadId === sentThreadId
    );

    if (matchedByThreadId) {
      const receivedDate = new Date(matchedByThreadId.payload.headers.find((h: any) => h.name === 'Date')?.value || '');

      // Only count if sent email is after received email (it's a reply)
      if (sentDate > receivedDate) {
        matchedPairs.push({ received: receivedDate, sent: sentDate });
        console.log(`Matched by thread ID: Received=${receivedDate.toISOString()}, Sent=${sentDate.toISOString()}`);
      }
    } else {
      // If no thread ID match, try by subject
      const matchedBySubject = inboxEmails.find((inboxEmail: any) => {
        const inboxSubject = inboxEmail.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
        const normalizedInboxSubject = inboxSubject.replace(/^Re:\s*/i, '');
        return normalizedInboxSubject === normalizedSentSubject;
      });

      if (matchedBySubject) {
        const receivedDate = new Date(matchedBySubject.payload.headers.find((h: any) => h.name === 'Date')?.value || '');

        // Only count if sent email is after received email (it's a reply)
        if (sentDate > receivedDate) {
          matchedPairs.push({ received: receivedDate, sent: sentDate });
          console.log(`Matched by subject: Received=${receivedDate.toISOString()}, Sent=${sentDate.toISOString()}`);
        }
      }
    }
  });

  console.log(`Found ${matchedPairs.length} matched email pairs for response time calculation`);

  // If we don't have any matched pairs, return a reasonable default
  if (matchedPairs.length === 0) {
    return 2.5;
  }

  // Calculate average response time
  const totalHours = matchedPairs.reduce((sum, pair) => {
    return sum + getHoursDifference(pair.received, pair.sent);
  }, 0);

  const averageHours = totalHours / matchedPairs.length;
  console.log(`Total response hours: ${totalHours}, Average: ${averageHours}`);

  return parseFloat(averageHours.toFixed(1));
};

export const getEmailAnalytics = async (
  token: string,
  providedInboxEmails?: any[],
  providedSentEmails?: any[]
): Promise<EmailAnalytics> => {
  try {
    console.log('Fetching email analytics');

    // Use provided emails if available, otherwise fetch them
    let inboxEmails: any[] = [];
    let sentEmails: any[] = [];

    if (providedInboxEmails && providedInboxEmails.length > 0) {
      console.log(`Using ${providedInboxEmails.length} provided inbox emails`);
      inboxEmails = providedInboxEmails;
    } else {
      console.log('No inbox emails provided, fetching from API');
      inboxEmails = await getEmails(token, 'inbox');
    }

    if (providedSentEmails && providedSentEmails.length > 0) {
      console.log(`Using ${providedSentEmails.length} provided sent emails`);
      sentEmails = providedSentEmails;
    } else {
      console.log('No sent emails provided, fetching from API');
      sentEmails = await getEmails(token, 'sent');
    }

    console.log(`Analytics: Using ${inboxEmails.length} inbox emails and ${sentEmails.length} sent emails`);

    // Get the start of the current month (for reference)
    const startOfMonth = getStartOfMonth();
    console.log(`Start of month: ${startOfMonth.toISOString()}`);

    // For debugging, log the current month and year
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    console.log(`Current month/year: ${currentMonth + 1}/${currentYear}`);

    // Use the raw counts for inbox and sent emails
    const messagesReceivedThisMonth = inboxEmails.length;
    const messagesSentThisMonth = sentEmails.length;

    console.log(`USING RAW COUNTS: Inbox=${messagesReceivedThisMonth}, Sent=${messagesSentThisMonth}`);

    // Log each inbox email for debugging
    inboxEmails.forEach((email: any, index: number) => {
      if (index < 5) { // Only log the first 5 emails to avoid console spam
        const subject = email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const dateHeader = email.payload?.headers?.find((h: any) => h.name === 'Date')?.value || 'No Date';
        console.log(`Inbox email ${index + 1}: Subject="${subject}", Date=${dateHeader}`);
      }
    });

    // Log each sent email for debugging
    sentEmails.forEach((email: any, index: number) => {
      if (index < 5) { // Only log the first 5 emails to avoid console spam
        const subject = email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const dateHeader = email.payload?.headers?.find((h: any) => h.name === 'Date')?.value || 'No Date';
        console.log(`Sent email ${index + 1}: Subject="${subject}", Date=${dateHeader}`);
      }
    });

    // Calculate pending messages (emails without replies)
    // For this implementation, we'll count emails in the inbox that don't have a corresponding reply in sent
    // This is an approximation - in a real app, you'd track this with thread IDs

    // Log for debugging
    console.log(`Calculating pending messages from ${inboxEmails.length} inbox emails and ${sentEmails.length} sent emails`);

    // Define thread info type
    interface ThreadInfo {
      threadId: string;
      subject: string;
    }

    // Extract subjects and thread IDs from inbox emails
    const inboxThreads: ThreadInfo[] = inboxEmails.map((email: any) => {
      const subject = email.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
      return {
        threadId: email.threadId,
        subject: subject.replace(/^Re:\s*/i, '') // Normalize subject by removing Re: prefix
      };
    });

    // Extract subjects and thread IDs from sent emails
    const sentThreads: ThreadInfo[] = sentEmails.map((email: any) => {
      const subject = email.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
      return {
        threadId: email.threadId,
        subject: subject.replace(/^Re:\s*/i, '') // Normalize subject by removing Re: prefix
      };
    });

    // Log thread IDs for debugging
    console.log('Inbox thread IDs:', inboxThreads.map((t: ThreadInfo) => t.threadId));
    console.log('Sent thread IDs:', sentThreads.map((t: ThreadInfo) => t.threadId));

    // Count emails that don't have a reply (using thread IDs when possible)
    const pendingThreads = inboxThreads.filter((inboxThread: ThreadInfo) => {
      // First try to match by thread ID (most accurate)
      const hasMatchingThreadId = sentThreads.some((sentThread: ThreadInfo) =>
        sentThread.threadId === inboxThread.threadId
      );

      if (hasMatchingThreadId) {
        return false; // Not pending, has a reply with matching thread ID
      }

      // Fall back to subject matching if thread ID doesn't match
      const hasMatchingSubject = sentThreads.some((sentThread: ThreadInfo) =>
        sentThread.subject === inboxThread.subject
      );

      return !hasMatchingSubject; // Pending if no matching subject found
    });

    // Log pending threads for debugging
    console.log('Pending threads:', pendingThreads);

    // Set the number of pending messages
    const pendingMessages = pendingThreads.length;

    // Calculate average response time
    // For this implementation, we'll use a reasonable approximation
    // In a real app, you'd track when each email was read and when the reply was sent
    const responseTimeAverage = calculateAverageResponseTime(inboxEmails, sentEmails);

    // Generate message volume over time (last 4 weeks)
    const weekStartDates = getLastFourWeekStartDates();
    const weeks = weekStartDates.map((_date, index) => `Week ${index + 1}`);

    // Calculate emails per week
    const receivedByWeek = calculateEmailsByWeek(inboxEmails, weekStartDates);
    const sentByWeek = calculateEmailsByWeek(sentEmails, weekStartDates);

    // Calculate response rate distribution
    const totalEmails = inboxEmails.length;

    // If there are no emails, set default values
    if (totalEmails === 0) {
      console.log('No emails found, using default response rate distribution');
      var responseRateDistribution = {
        replied: 0,
        pending: 0,
        ignored: 0
      };
    } else {
      // Calculate replied count based on thread matching
      const repliedCount = totalEmails - pendingMessages;

      // For pending vs ignored, we'll use a time-based heuristic
      // Emails older than 7 days without a reply are considered "ignored"
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Count ignored emails (pending emails older than 7 days)
      const ignoredThreads = pendingThreads.filter((thread: ThreadInfo) => {
        // Find the original email
        const email = inboxEmails.find((e: any) => e.threadId === thread.threadId);
        if (!email) return false;

        // Get the date
        const dateHeader = email.payload.headers.find((h: any) => h.name === 'Date')?.value;
        if (!dateHeader) return false;

        const emailDate = new Date(dateHeader);
        return emailDate < sevenDaysAgo;
      });

      const ignoredCount = ignoredThreads.length;
      const pendingCount = pendingMessages - ignoredCount;

      console.log(`Response distribution: Total=${totalEmails}, Replied=${repliedCount}, Pending=${pendingCount}, Ignored=${ignoredCount}`);

      // Calculate percentages
      var responseRateDistribution = {
        replied: Math.round((repliedCount / totalEmails) * 100) || 0,
        pending: Math.round((pendingCount / totalEmails) * 100) || 0,
        ignored: Math.round((ignoredCount / totalEmails) * 100) || 0
      };

      // Ensure percentages add up to 100%
      const total = responseRateDistribution.replied + responseRateDistribution.pending + responseRateDistribution.ignored;
      if (total !== 100 && total !== 0) {
        // Adjust the largest value to make the total 100%
        const diff = 100 - total;
        if (responseRateDistribution.replied >= responseRateDistribution.pending &&
            responseRateDistribution.replied >= responseRateDistribution.ignored) {
          responseRateDistribution.replied += diff;
        } else if (responseRateDistribution.pending >= responseRateDistribution.replied &&
                  responseRateDistribution.pending >= responseRateDistribution.ignored) {
          responseRateDistribution.pending += diff;
        } else {
          responseRateDistribution.ignored += diff;
        }
      }
    }

    console.log('Final response rate distribution:', responseRateDistribution);

    // For this demo, we'll use email as the primary channel
    // In a real app, you'd have actual channel data
    const topCommunicationChannels = {
      email: 65,
      sms: 25,
      inApp: 10
    };

    return {
      totalMessagesReceived: messagesReceivedThisMonth,
      messagesSent: messagesSentThisMonth,
      pendingMessages,
      responseTimeAverage,
      messageVolumeOverTime: {
        weeks,
        received: receivedByWeek,
        sent: sentByWeek
      },
      responseRateDistribution,
      topCommunicationChannels
    };
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    // Return default values in case of error
    return {
      totalMessagesReceived: 0,
      messagesSent: 0,
      pendingMessages: 0,
      responseTimeAverage: 0,
      messageVolumeOverTime: {
        weeks: [],
        received: [],
        sent: []
      },
      responseRateDistribution: {
        replied: 0,
        pending: 0,
        ignored: 0
      },
      topCommunicationChannels: {
        email: 0,
        sms: 0,
        inApp: 0
      }
    };
  }
};
