require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const birthdayRoutes = require("./routes/birthday");
const authRoutes = require("./routes/auth");

// Import cron function
const startBirthdayCron = require("./services/birthdayCron");



console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
const app = express();

/* ---------------- SECURITY ---------------- */

app.use(helmet());

app.use(cors({
    origin: "*"
}));

app.use(express.json());

app.use(morgan("dev"));

/* ---------------- RATE LIMIT ---------------- */

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

/* ---------------- DATABASE ---------------- */

connectDB();

/* ---------------- START CRON ---------------- */

startBirthdayCron();

/* ---------------- ROUTES ---------------- */

app.use("/auth", authRoutes);
app.use("/birthdays", birthdayRoutes);

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
    res.send("Birthday Reminder API 🚀 Running Secure Version");
});

app.get("/hello", (req, res) => {
    res.send("✅ Server Working Fine");
});

/* ---------------- TEST EMAIL ---------------- */

app.get("/test-email", async (req, res) => {

    try {

        const sendBirthdayEmail = require("./services/emailService");

        await sendBirthdayEmail(
            process.env.EMAIL_USER,
            "Priti Kumari",
            "Tomorrow",
            1
        );

        res.send("✅ Test email sent");

    } catch (err) {

        console.error(err);

        res.status(500).send("Email failed");

    }

});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});
