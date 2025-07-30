import { google } from 'googleapis';
import { ConfidentialClientApplication } from '@azure/msal-node';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { EmailIntegration, SynchronizedEmail, UpsertSynchronizedEmail } from '@shared/schema';

const ENCRYPTION_KEY = process.env.SESSION_SECRET || 'your-32-character-secret-key';
const ALGORITHM = 'aes-256-cbc';

// Encryption utilities - using same system as routes.ts
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid encrypted text provided for decryption');
  }
  const textParts = text.split(':');
  if (textParts.length < 2) {
    throw new Error('Invalid encrypted text format');
  }
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Gmail OAuth configuration
export class GmailService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/gmail/callback`
    );
  }

  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getAccessToken(code);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  async getEmails(integration: EmailIntegration, maxResults: number = 50): Promise<UpsertSynchronizedEmail[]> {
    try {
      // Parse the encrypted tokens from the database
      const decryptedTokens = decrypt(integration.encryptedTokens);
      const tokens = JSON.parse(decryptedTokens);
      
      this.oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Get list of messages
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox'
      });

      const emails: UpsertSynchronizedEmail[] = [];

      if (response.data.messages) {
        for (const message of response.data.messages) {
          const messageDetails = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full'
          });

          const headers = messageDetails.data.payload?.headers || [];
          const fromHeader = headers.find(h => h.name === 'From')?.value || '';
          const toHeader = headers.find(h => h.name === 'To')?.value || '';
          const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
          const dateHeader = headers.find(h => h.name === 'Date')?.value || '';

          // Extract email and name from headers
          const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || fromHeader.match(/^(.+)$/);
          const fromName = fromMatch?.[1]?.trim().replace(/"/g, '') || '';
          const fromEmail = fromMatch?.[2] || fromMatch?.[1] || '';

          const toMatch = toHeader.match(/^(.+?)\s*<(.+?)>$/) || toHeader.match(/^(.+)$/);
          const toName = toMatch?.[1]?.trim().replace(/"/g, '') || '';
          const toEmail = toMatch?.[2] || toMatch?.[1] || '';

          // Get email body
          let bodyText = '';
          let bodyHtml = '';
          
          const getBody = (payload: any) => {
            if (payload.body?.data) {
              const body = Buffer.from(payload.body.data, 'base64').toString();
              if (payload.mimeType === 'text/plain') {
                bodyText = body;
              } else if (payload.mimeType === 'text/html') {
                bodyHtml = body;
              }
            }
            
            if (payload.parts) {
              payload.parts.forEach((part: any) => getBody(part));
            }
          };

          if (messageDetails.data.payload) {
            getBody(messageDetails.data.payload);
          }

          const snippet = messageDetails.data.snippet || '';
          const receivedAt = dateHeader ? new Date(dateHeader) : new Date();

          emails.push({
            integrationId: integration.id,
            userId: integration.userId,
            messageId: message.id!,
            threadId: messageDetails.data.threadId || null,
            fromEmail: fromEmail.toLowerCase(),
            fromName: fromName || null,
            toEmail: toEmail.toLowerCase(),
            toName: toName || null,
            subject: subjectHeader || null,
            bodyText: bodyText || null,
            bodyHtml: bodyHtml || null,
            snippet: snippet.substring(0, 200),
            isRead: !messageDetails.data.labelIds?.includes('UNREAD'),
            isImportant: messageDetails.data.labelIds?.includes('IMPORTANT') || false,
            hasAttachments: (messageDetails.data.payload?.parts?.length || 0) > 1,
            labels: messageDetails.data.labelIds || [],
            receivedAt,
            sentAt: receivedAt,
          });
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching Gmail emails:', error);
      throw error;
    }
  }

  async sendEmail(integration: EmailIntegration, to: string, subject: string, body: string, replyToMessageId?: string) {
    try {
      this.oauth2Client.setCredentials({
        access_token: decrypt(integration.accessToken!),
        refresh_token: decrypt(integration.refreshToken!),
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        '',
        body
      ].join('\n');

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const request: any = {
        userId: 'me',
        resource: {
          raw: encodedEmail,
        },
      };

      if (replyToMessageId) {
        request.resource.threadId = replyToMessageId;
      }

      const response = await gmail.users.messages.send(request);
      return response.data.id;
    } catch (error) {
      console.error('Error sending Gmail email:', error);
      throw error;
    }
  }
}

// Outlook/Microsoft Graph Service
export class OutlookService {
  private msalClient: ConfidentialClientApplication;

  constructor() {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID || '',
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
        authority: 'https://login.microsoftonline.com/common'
      }
    });
  }

  getAuthUrl(userId: string): string {
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/outlook/callback`;
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.OUTLOOK_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send')}&` +
      `state=${userId}&` +
      `prompt=consent`;
  }

  async exchangeCodeForTokens(code: string) {
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/outlook/callback`;
    
    const tokenRequest = {
      code,
      scopes: ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send'],
      redirectUri,
    };

    const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    return response;
  }

  async refreshTokens(refreshToken: string) {
    const refreshRequest = {
      refreshToken,
      scopes: ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send'],
    };

    const response = await this.msalClient.acquireTokenByRefreshToken(refreshRequest);
    return response;
  }

  async getEmails(integration: EmailIntegration, maxResults: number = 50): Promise<UpsertSynchronizedEmail[]> {
    try {
      const accessToken = decrypt(integration.accessToken!);
      
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$orderby=receivedDateTime desc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.statusText}`);
      }

      const data = await response.json();
      const emails: UpsertSynchronizedEmail[] = [];

      for (const message of data.value) {
        emails.push({
          integrationId: integration.id,
          userId: integration.userId,
          messageId: message.id,
          threadId: message.conversationId || null,
          fromEmail: message.from?.emailAddress?.address?.toLowerCase() || '',
          fromName: message.from?.emailAddress?.name || null,
          toEmail: message.toRecipients?.[0]?.emailAddress?.address?.toLowerCase() || '',
          toName: message.toRecipients?.[0]?.emailAddress?.name || null,
          subject: message.subject || null,
          bodyText: message.body?.contentType === 'text' ? message.body?.content : null,
          bodyHtml: message.body?.contentType === 'html' ? message.body?.content : null,
          snippet: message.bodyPreview?.substring(0, 200) || '',
          isRead: message.isRead || false,
          isImportant: message.importance === 'high',
          hasAttachments: message.hasAttachments || false,
          labels: message.categories || [],
          receivedAt: new Date(message.receivedDateTime),
          sentAt: new Date(message.sentDateTime || message.receivedDateTime),
        });
      }

      return emails;
    } catch (error) {
      console.error('Error fetching Outlook emails:', error);
      throw error;
    }
  }

  async sendEmail(integration: EmailIntegration, to: string, subject: string, body: string, replyToMessageId?: string) {
    try {
      const accessToken = decrypt(integration.accessToken!);

      const message = {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      };

      let endpoint = 'https://graph.microsoft.com/v1.0/me/sendMail';
      if (replyToMessageId) {
        endpoint = `https://graph.microsoft.com/v1.0/me/messages/${replyToMessageId}/reply`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(replyToMessageId ? { message } : { message })
      });

      if (!response.ok) {
        throw new Error(`Outlook send error: ${response.statusText}`);
      }

      return 'sent'; // Outlook doesn't return message ID for sent emails
    } catch (error) {
      console.error('Error sending Outlook email:', error);
      throw error;
    }
  }
}

// SMTP Service for manual email configuration
export class SMTPService {
  async testConnection(config: any): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecurity === 'ssl',
        auth: {
          user: config.smtpUsername,
          pass: config.smtpPassword,
        },
        tls: {
          rejectUnauthorized: config.smtpSecurity !== 'none'
        }
      });

      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }

  async sendEmail(integration: EmailIntegration, to: string, subject: string, body: string) {
    try {
      const transporter = nodemailer.createTransporter({
        host: integration.smtpHost!,
        port: integration.smtpPort!,
        secure: integration.smtpSecurity === 'ssl',
        auth: {
          user: integration.smtpUsername!,
          pass: decrypt(integration.smtpPassword!),
        },
        tls: {
          rejectUnauthorized: integration.smtpSecurity !== 'none'
        }
      });

      const result = await transporter.sendMail({
        from: `"${integration.displayName || integration.email}" <${integration.email}>`,
        to: to,
        subject: subject,
        html: body,
      });

      return result.messageId;
    } catch (error) {
      console.error('Error sending SMTP email:', error);
      throw error;
    }
  }

  // Note: SMTP doesn't provide IMAP functionality for reading emails
  // For SMTP configurations, users would need to also provide IMAP settings
  async getEmails(integration: EmailIntegration, maxResults: number = 50): Promise<UpsertSynchronizedEmail[]> {
    // This would require IMAP implementation
    // For now, return empty array and suggest users use Gmail/Outlook for full functionality
    console.log('IMAP email fetching not implemented yet for SMTP configurations');
    return [];
  }
}

// Factory function to get the appropriate email service
export function getEmailService(provider: string) {
  switch (provider) {
    case 'gmail':
      return new GmailService();
    case 'outlook':
      return new OutlookService();
    case 'smtp':
      return new SMTPService();
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}