declare module './emailService' {
  export function getEmails(token: string, folder: 'inbox' | 'sent'): Promise<any[]>;
}
