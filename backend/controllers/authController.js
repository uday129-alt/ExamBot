import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Helper to sign JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function registerUser(req, res, next) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email or username');
    }

    // Default to student if role is not supplied or invalid
    const finalRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      username,
      email,
      password,
      role: finalRole,
    });

    if (user) {
      logger.success(`User registered: ${user.username} (${user.role})`);
      res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter email and password');
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      logger.success(`User logged in: ${user.username} (${user.role})`);
      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
}
