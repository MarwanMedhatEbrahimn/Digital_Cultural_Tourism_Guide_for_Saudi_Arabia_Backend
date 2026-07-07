const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Tourist Registration
const registerTourist = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if tourist already exists
    const existingTourist = await prisma.tourist.findUnique({
      where: { email },
    });

    if (existingTourist) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create tourist
    const tourist = await prisma.tourist.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        tourist_id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ tourist_id: tourist.tourist_id, email: tourist.email });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        tourist,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Tourist Login
const loginTourist = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find tourist
    const tourist = await prisma.tourist.findUnique({
      where: { email },
    });

    if (!tourist) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, tourist.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken({ tourist_id: tourist.tourist_id, email: tourist.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        tourist: {
          tourist_id: tourist.tourist_id,
          name: tourist.name,
          email: tourist.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Tourist Profile
const getProfile = async (req, res, next) => {
  try {
    const tourist = await prisma.tourist.findUnique({
      where: { tourist_id: req.tourist.tourist_id },
      select: {
        tourist_id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: tourist,
    });
  } catch (error) {
    next(error);
  }
};

// Update Tourist Profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const tourist = await prisma.tourist.update({
      where: { tourist_id: req.tourist.tourist_id },
      data: updateData,
      select: {
        tourist_id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: tourist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTourist,
  loginTourist,
  getProfile,
  updateProfile,
};
