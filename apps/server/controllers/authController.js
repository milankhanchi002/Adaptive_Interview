const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required'
  }),
  role: Joi.string().valid('user', 'interviewer').default('user'),
  profile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    domain: Joi.string().valid('Computer Science', 'Marketing', 'Finance', 'Other'),
    experience: Joi.string().valid('Beginner', 'Intermediate', 'Advanced')
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

class AuthController {
  async register(req, res, next) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { username, email, password, role, profile } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'User with this email or username already exists' 
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        role: role || 'user',
        profile: {
          ...profile,
          domain: profile?.domain || 'Computer Science',
          experience: profile?.experience || 'Beginner'
        }
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please login.',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const allowedUpdates = ['profile.firstName', 'profile.lastName', 'profile.domain', 'profile.experience'];
      const updates = {};

      Object.keys(req.body).forEach(key => {
        if (key.startsWith('profile.')) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();