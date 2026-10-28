const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const cleanEmail = email.trim();
    // Case-insensitive lookup so mobile keyboard auto-capitalization does not break login
    const escapedEmail = cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const user = await User.findOne({
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            favorites: user.favorites || [],
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const cleanEmail = email.trim().toLowerCase();
    const escapedEmail = cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    const userExists = await User.findOne({
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        full_name: full_name.trim(),
        email: cleanEmail,
        password,
        role: role || 'customer',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url || '',
            favorites: user.favorites || [],
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            favorites: user.favorites || [],
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.full_name = req.body.full_name || user.full_name;
        user.avatar_url = req.body.avatar_url || user.avatar_url;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar_url: updatedUser.avatar_url,
            favorites: updatedUser.favorites || [],
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user favorites
// @route   GET /api/auth/favorites
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');
    
    if (user) {
        res.json(user.favorites || []);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle favorite property
// @route   PUT /api/auth/favorites/:propertyId
const toggleFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    if (user) {
        user.favorites = user.favorites || [];
        const isFavorite = user.favorites.some(id => id.toString() === propertyId);

        if (isFavorite) {
            user.favorites = user.favorites.filter(id => id.toString() !== propertyId);
        } else {
            user.favorites.push(propertyId);
        }

        await user.save();
        res.json(user.favorites);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { 
    authUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile,
    getFavorites,
    toggleFavorite
};
