const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'hello@swiftsites.nz';
const EMAIL_TO = process.env.EMAIL_TO || 'hello@swiftsites.nz';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { Name, Email, Phone, Address, Service, Details } = req.body;

  if (!Name || !Email || !Service) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // Notify NZ Mow Bros (via SwiftSites email for now)
    await resend.emails.send({
      from: `NZ Mow Bros Website <${EMAIL_FROM}>`,
      to: EMAIL_TO,
      replyTo: Email,
      subject: `New Quote Request: ${Name} — ${Service}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 3px solid #4caf50; padding-bottom: 8px;">
            New Quote Request — NZ Mow Bros
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #555; width: 120px;">Name</td>
              <td style="padding: 8px 12px;">${Name}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px 12px; font-weight: 600; color: #555;">Email</td>
              <td style="padding: 8px 12px;"><a href="mailto:${Email}">${Email}</a></td>
            </tr>
            ${Phone ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">Phone</td><td style="padding: 8px 12px;">${Phone}</td></tr>` : ''}
            ${Address ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Address</td><td style="padding: 8px 12px;">${Address}</td></tr>` : ''}
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #555;">Service</td>
              <td style="padding: 8px 12px;">${Service}</td>
            </tr>
          </table>
          ${Details ? `
          <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <p style="font-weight: 600; color: #555; margin: 0 0 8px;">Additional Details:</p>
            <p style="margin: 0; white-space: pre-wrap;">${Details}</p>
          </div>` : ''}
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Submitted via nzmowbros.co.nz at ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}
          </p>
        </div>
      `,
    });

    // Auto-reply to the customer
    await resend.emails.send({
      from: `NZ Mow Bros <${EMAIL_FROM}>`,
      to: Email,
      subject: "Thanks for your quote request — we'll be in touch soon!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <p style="font-size: 16px; line-height: 1.7;">Hi ${Name},</p>
          <p style="font-size: 16px; line-height: 1.7;">
            Thanks for reaching out to NZ Mow Bros! We've received your quote request for <strong>${Service}</strong> and we'll get back to you within a few hours with an honest price.
          </p>
          <p style="font-size: 16px; line-height: 1.7;">
            If it's urgent, feel free to give us a call or text directly.
          </p>
          <p style="font-size: 16px; line-height: 1.7; margin-top: 24px;">
            Cheers,<br/>
            Jasper &amp; Luke<br/>
            <span style="color: #888;">NZ Mow Bros Limited</span><br/>
            <a href="https://nzmowbros.co.nz" style="color: #4caf50; text-decoration: none;">nzmowbros.co.nz</a>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'Quote request sent!' });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
