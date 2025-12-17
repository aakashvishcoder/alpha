const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // initialize express, jwt, and User

const router = express.Router();

// posting the register data
router.post('/register', async (req, res) => {
    const { name, email, password, schoolName, yearLevel }= req.body;
    try {
        let user = await User.findOne({ email});
        if (user) return res.status(400).json({ error: "User already exists."});

        user = new User({ name,email,password, schoolName, yearLevel});
        await User.save();

        const token = jwt.sign({ id: user._id, email: user.email}, process.env.JWT_SECRET ,{
            expiresIn: process.env.JWT_EXPIRE,
        });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email }});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error'});
    }
});

// posting login data
router.post('/login', async (req, res) => {
    const { email, password} = req.body;
    
    try {
        const user =await User.findOne({ email});
        if (!user) return res.status(400).json({ error: 'Invalid credentials'});

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials'});

        const token = jwt.sign({ id: user._id, email: user.email}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email}});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error'});
    }
});

module.exports = router;