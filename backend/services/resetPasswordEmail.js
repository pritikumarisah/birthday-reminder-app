const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, "")
    }
});

async function sendResetEmail(to, resetLink) {

    await transporter.sendMail({

        from: `"Birthday Reminder App" <${process.env.EMAIL_USER}>`,

        to,

        subject: "Reset Your Password",

        html: `
            <h2>Reset Password</h2>

            <p>You requested to reset your password.</p>

            <p>
                Click the button below:
            </p>

            <a href="${resetLink}"
               style="
                    background:#4CAF50;
                    color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:5px;
               ">
               Reset Password
            </a>

            <br><br>

            <p>
                This link expires in 15 minutes.
            </p>

            <p>
                If you didn't request this, ignore this email.
            </p>
        `
    });

    console.log("✅ Reset password email sent to", to);
}

module.exports = sendResetEmail;