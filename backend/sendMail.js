const nodemailer = require('nodemailer');

// Configure your SMTP service here (for demo, using Gmail; for production, use environment vars and secure setup)
// To use Outlook/Office365 SMTP:
// Set MAIL_USER to your Outlook email and MAIL_PASS to your Outlook app password or real password (if allowed by your organization).
// To use Gmail SMTP:
// Set MAIL_USER to your Gmail and MAIL_PASS to your Gmail App Password (not your normal password).
// Send mail with dynamic credentials
// (nodemailer is already required at the top of the file)

async function sendWeeklyLeaveMail({ to, subject, html, user, appPassword }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass: appPassword
    }
  });
  const mailOptions = {
    from: user,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendWeeklyLeaveMail };
