const cron = require("node-cron");
const Birthday = require("../models/Birthday");
const User = require("../models/User");
const sendBirthdayEmail = require("./emailService");

function startBirthdayCron() {

    // Runs every day at 9:00 AM
    cron.schedule("0 9 * * *", async () => {

        console.log("🎂 Checking birthday reminders...");

        try {

            const birthdays = await Birthday.find();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const b of birthdays) {

                // Find the owner of this birthday
                const user = await User.findById(b.userId).select("email");

                if (!user || !user.email) continue;

                const birth = new Date(b.date);

                let nextBirthday = new Date(
                    today.getFullYear(),
                    birth.getMonth(),
                    birth.getDate()
                );

                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const diffTime = nextBirthday - today;

                const diffDays = Math.ceil(
                    diffTime / (1000 * 60 * 60 * 24)
                );

                const reminderDays = Number(b.reminder || 0);

                // ================= REMINDER EMAIL =================
                if (diffDays === reminderDays) {

                    console.log(
                        `📧 Sending reminder to ${user.email} for ${b.name}`
                    );

                    try {
                        await sendBirthdayEmail(
                            user.email,
                            b.name,
                            nextBirthday.toDateString(),
                            reminderDays
                        );
                    } catch (err) {
                        console.error(
                            "Email failed for:",
                            user.email,
                            err.message
                        );
                    }
                }

                // ================= BIRTHDAY EMAIL =================
                if (diffDays === 0) {

                    console.log(
                        `🎉 Sending birthday wishes to ${user.email}`
                    );

                    try {
                        await sendBirthdayEmail(
                            user.email,
                            b.name,
                            nextBirthday.toDateString(),
                            0
                        );
                    } catch (err) {
                        console.error(
                            "Birthday email failed for:",
                            user.email,
                            err.message
                        );
                    }
                }
            }

        } catch (err) {
            console.error("Cron Job Error:", err);
        }

    });

    console.log("✅ Birthday Reminder Cron Started");
}

module.exports = startBirthdayCron;