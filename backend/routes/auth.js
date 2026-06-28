
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendResetEmail = require("../services/resetPasswordEmail");

const router = express.Router();

/* ================= TEST ROUTE ================= */
router.get("/register", (req, res) => {
    res.send("Register route working ✅");
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                error: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");

        // Save token in database
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + (15 * 60 * 1000);

        await user.save();

        // Create reset link
        const resetLink =
            `http://localhost:5500/reset-password.html?token=${token}`;

        // Send email
        await sendResetEmail(
            user.email,
            resetLink
        );

        res.json({
            message: "Password reset link sent successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

/* ================= EXPORT ================= */

module.exports = router;

