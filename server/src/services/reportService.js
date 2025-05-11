// src/services/reportService.js

// Helper: decode email headers
function getHeader(headers, name) {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : null;
}

// Helper: extract plain subject
function normalizeSubject(subject) {
  return subject
    ?.replace(/^re:/i, '')
    .replace(/^fw:/i, '')
    .trim()
    .toLowerCase();
}

export const generateEmailReport = (emails) => {
  const senderCounts = {};
  const subjectCounts = {};
  let totalSize = 0;
  let recentEmails = [];

  for (const email of emails) {
    const headers = email.payload?.headers || [];

    const from = getHeader(headers, 'From');
    const subject = normalizeSubject(getHeader(headers, 'Subject'));
    const date = getHeader(headers, 'Date');

    if (from) {
      senderCounts[from] = (senderCounts[from] || 0) + 1;
    }

    if (subject) {
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    }

    if (email.sizeEstimate) {
      totalSize += email.sizeEstimate;
    }

    if (date) {
      recentEmails.push({ from, subject, date });
    }
  }

  // Get top sender
  const mostFrequentSender = Object.entries(senderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)[0]?.[0] || null;

  // Top 5 subjects
  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subject]) => subject);

  // Sort recent emails by date
  recentEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    mostFrequentSender,
    topSubjects,
    totalSizeEstimate: totalSize,
    recentEmails: recentEmails.slice(0, 5),
  };
};
