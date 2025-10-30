const cron = require('node-cron');
const pool = require('../../db'); // your db.js
const fetch = require('node-fetch'); // if needed, otherwise query DB directly
const nodemailer = require('nodemailer'); // if you're using nodemailer to send email

// Function to fetch alerts and send email
async function fetchAlertsAndSendEmail() {
  try {
    
    // Join Alerts with Inventory to get item names
    const alertsResult = await pool.query(`
      SELECT A.alerttype, A.datetriggered, A.department, I.name AS itemname
      FROM Alerts A
      JOIN Inventory I ON A.affecteditemid = I.itemid
      WHERE A.alertstatus = 'Active'
    `);

    const alerts = alertsResult.rows;

    if (alerts.length > 0) {
      let message = "The following inventory items have alerts:\n\n";
      alerts.forEach(alert => {
     message += `- [${alert.alerttype}] ${alert.itemname} (Triggered on ${alert.datetriggered}, Dept: ${alert.department})\n`;
});

      // Send the email
      await sendAlertEmail("WasteLess Inventory Alert", message);
      console.log("Daily alert email sent successfully!");
    } else {
      console.log("No alerts to send today.");
    }
  } catch (err) {
    console.error("Error fetching alerts or sending email:", err);
  }
}

// Example email sending function (using nodemailer)
async function sendAlertEmail(subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or SMTP config
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"WasteLess App" <larisa.smith11@gmail.com>',
    to: 'lbsmith2@mail.fhsu.edu, p_martinez5@mail.fhsu.edu, j_holcomb@mail.fhsu.edu, brtilley@mail.fhsu.edu',
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
}

// Schedule the task: run once every 24 hours
cron.schedule('0 0 * * *', () => {
  console.log('Running daily alert email job...');
  fetchAlertsAndSendEmail();
}, {
  timezone: "America/Detroit" // or your local timezone
});

//fetchAlertsAndSendEmail(); // <-- this runs the email logic immediately
//uncomment if want to check email without waiting for the time