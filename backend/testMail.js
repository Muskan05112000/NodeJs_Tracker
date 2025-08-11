const { sendWeeklyLeaveMail } = require('./sendMail');

sendWeeklyLeaveMail({
  to: 'chauhanmuskan37@gmail.com', // <-- Replace with your real email address for this test
  subject: 'Test Email from Leave Tracker',
  html: '<h1>This is a test email from your backend setup.</h1>'
}).then(() => {
  console.log('Mail sent!');
  process.exit(0);
}).catch((err) => {
  console.error('Mail send error:', err);
  process.exit(1);
});
