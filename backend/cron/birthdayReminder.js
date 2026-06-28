const cron = require("node-cron");
const User = require("../models/User");
const Birthday = require("../models/Birthday");
const sendBirthdayEmail = require("../utils/sendEmail");

// Runs every day at 9 AM
cron.schedule("0 9 * * *", async () => {
    try {

        console.log("🔔 Running birthday reminder job...");

        const users = await User.find();

        const today = new Date();

        for (const user of users) {

            const birthdays = await Birthday.find({
                userId: user._id
            });

            for (const b of birthdays) {

                const birthDate = new Date(b.date);

                const nextBirthday = new Date(
                    today.getFullYear(),
                    birthDate.getMonth(),
                    birthDate.getDate()
                );

                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const diffDays = Math.ceil(
                    (nextBirthday - today) / (1000 * 60 * 60 * 24)
                );

                // 🎯 send reminder 1 day before
                if (diffDays === b.reminder || diffDays === 1) {

                    await sendBirthdayEmail(
                        user.email,
                        user.name,
                        b.name
                    );
                }
            }
        }

        console.log("✅ Reminder emails sent");

    } catch (err) {
        console.error("Cron error:", err);
    }
});