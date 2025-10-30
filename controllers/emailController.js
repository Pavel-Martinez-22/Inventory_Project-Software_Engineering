const nodemailer = require('nodemailer');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or 'Outlook', 'Yahoo', etc
  auth: {
    user: process.env.EMAIL_USER, //user email
    pass: process.env.EMAIL_PASS,    // Use an app password (not your real password!)
  }
});

exports.sendAlertEmail = async (req, res) => {
  const { subject, text, to } = req.body;

  if (!subject || !text || !to) {
    return res.status(400).json({ error: 'Subject, text, and recipient email are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"WasteLess Alert" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};