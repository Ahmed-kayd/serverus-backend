const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');

// Registration route
router.post('/register', async (req, res) => {
    let { name, email, password } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Name cannot be empty." });
    }  
    try {
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Handle unique violation for email
            return res.status(409).json({ message: "Email already exists" });
        }else {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.rows[0].password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({ message: "Logged in successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
