// MODULES:
const nodemailer = require('nodemailer');

//-------------Here-------------//
const sendEmail = async options => {
  // 1)- Create transporter.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    secure: false
  });

  // 2)- Define mail options.
  const mailOptions = {
    from: 'Ahmed Khattab 🧓<ahmed@hello.io>',
    to: options.email,
    subject: options.subject,
    text: options.message // Text -V of email
    // html:  // HTML -V of email
  };

  // 3)- Finally send the email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
