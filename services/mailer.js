const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // APP PASSWORD
  },
});

async function sendMailToUser(email) {
  await transporter.sendMail({
    from: `"My Website" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Thanks for subscribing',
    html: `
      <h2>Hello 👋</h2>
      <p>Thanks for subscribing.</p>
    `,
  });
}

module.exports = sendMailToUser;
