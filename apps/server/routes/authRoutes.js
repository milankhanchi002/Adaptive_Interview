const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile (protected)
router.get('/profile', authMiddleware, authController.getProfile);

// Update user profile (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
