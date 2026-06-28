const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBirthdayEmail = async (to, name, birthdayName) => {
    await transporter.sendMail({
        from: `"Birthday App 🎂" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🎉 Upcoming Birthday Reminder",
        html: `
            <h2>Hey ${name} 👋</h2>
            <p>Don't forget! 🎂</p>
            <h3>${birthdayName}'s birthday is coming soon!</h3>
            <p>Send them wishes 🎁✨</p>
        `
    });
};

module.exports = sendBirthdayEmail;