const express = require("express");
const Birthday = require("../models/Birthday");
const sendBirthdayEmail = require("../services/emailService");

const router = express.Router();

router.get("/", async (req, res) => {

    const birthdays = await Birthday.find();

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (let b of birthdays) {

        if (!b.email) continue;

        const birthDate = new Date(b.date);

        if (
            birthDate.getDate() === tomorrow.getDate() &&
            birthDate.getMonth() === tomorrow.getMonth()
        ) {
            await sendBirthdayEmail(b.email, b.name);
        }
    }

    res.send("Emails Sent 🚀");
});

module.exports = router;