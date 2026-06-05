import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'onboarding@resend.dev') {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async sendDraftResponse(to: string, businessName: string, reviewContent: string, draftResponse: string, yelpUrl: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: `New Yelp Review for ${businessName} - Draft Response Ready`,
      html: `
        <h2>New Yelp Review Received</h2>
        <p><strong>Review:</strong> "${reviewContent}"</p>
        <hr />
        <h3>AI Draft Response:</h3>
        <p>${draftResponse}</p>
        <p>Since Yelp doesn't allow automatic replies via API, please copy the response above and post it manually on Yelp:</p>
        <a href="${yelpUrl}" target="_blank">View Review on Yelp</a>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  }
}
