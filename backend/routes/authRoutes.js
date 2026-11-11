const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, 'Student')
        `;

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ message: "Email already registered" });
                }
                return res.status(500).json({ message: "Registration failed" });
            }

            res.status(201).json({
                message: "Registration successful",
                userId: result.insertId
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const user = results[0];

            try {
                const validPassword = await bcrypt.compare(password, user.password);

                if (!validPassword) {
                    return res.status(401).json({ message: "Invalid email or password" });
                }

                const token = jwt.sign(
                    { userId: user.user_id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.user_id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } catch (error) {
                res.status(500).json({ message: "Server error" });
            }
        }
    );
});

module.exports = router;