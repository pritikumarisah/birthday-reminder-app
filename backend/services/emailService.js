require("dotenv").config();

console.log("EMAIL_USER from emailService =", process.env.EMAIL_USER);
console.log("EMAIL_PASS from emailService =", process.env.EMAIL_PASS);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendBirthdayEmail(to, name, birthdayDate, reminderDays) {

    console.log("EMAIL_USER =", process.env.EMAIL_USER);
    console.log("EMAIL_PASS =", process.env.EMAIL_PASS);

    await transporter.verify();
    console.log("✅ SMTP Connected");

    await transporter.sendMail({
        from: `"Birthday Reminder 🎂" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Birthday Reminder for ${name}`,
        html: `
            <h2>🎂 Birthday Reminder</h2>
            <p>${name}'s birthday is in <b>${reminderDays}</b> day(s).</p>
            <p>Birthday: ${birthdayDate}</p>
        `
    });

    console.log("✅ Email Sent");
}

module.exports = sendBirthdayEmail;