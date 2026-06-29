import { Resend } from 'resend';

/**
 * Email utility for sending outreach emails via Resend SDK
 */
export async function sendOutreachEmail({ 
  to, 
  subject, 
  body 
}: { 
  to: string, 
  subject: string, 
  body: string 
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email will be logged but not sent.');
    console.log('[MOCK EMAIL SEND]:', { to, subject, body });
    return { success: true, id: 'mock-id-' + Math.random().toString(36).substring(7) };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'ReplyEngine <replyengine-5b63ce89@ctomail.io>',
      to: [to],
      subject: subject,
      text: body,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
