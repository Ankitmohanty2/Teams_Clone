const User = require('../models/User');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Set session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.status(201).json({ message: 'Registration successful', user: req.session.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Set session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.status(200).json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

exports.requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    // If not authenticated, redirect or send 401 based on request type
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ message: 'Authentication required' });
    } else {
        return res.redirect('/');
    }
};
