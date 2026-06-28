const express = require("express");
const Birthday = require("../models/Birthday");
const auth = require("../middleware/auth");

const router = express.Router();


/* ================= GET USER BIRTHDAYS ================= */
router.get("/", auth, async (req, res) => {
    try {

        const birthdays = await Birthday.find({
            userId: req.user.id
        });

        res.json(birthdays);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


/* ================= CREATE BIRTHDAY ================= */
router.post("/", auth, async (req, res) => {
    try {

        console.log("========= CREATE BIRTHDAY =========");
        console.log("Decoded User:", req.user);
        console.log("Request Body:", req.body);

        const birthday = await Birthday.create({
            userId: req.user.id,
            name: req.body.name,
            date: req.body.date,
            contact: req.body.contact,
            
            gift: req.body.gift,
            reminder: req.body.reminder
        });

        console.log("Saved:", birthday);

        res.status(201).json(birthday);

    } catch (error) {

        console.log("CREATE ERROR:");
        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
});
/* ================= UPDATE (ONLY OWN DATA) ================= */

router.put("/:id", auth, async (req, res) => {
    try {

        const updatedBirthday = await Birthday.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id
            },
            {
                name: req.body.name,
                date: req.body.date,
                contact: req.body.contact,
                gift: req.body.gift,
                reminder: req.body.reminder
            },
            {
                new: true
            }
        );

        if (!updatedBirthday) {
            return res.status(404).json({
                message: "Birthday not found"
            });
        }

        res.json(updatedBirthday);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
});



/* ================= DELETE (ONLY OWN DATA) ================= */
router.delete("/:id", auth, async (req, res) => {
    try {

        const deletedBirthday = await Birthday.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id   // 🔐 security check
        });

        if (!deletedBirthday) {
            return res.status(404).json({
                message: "Birthday not found"
            });
        }

        res.json({
            message: "Deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;