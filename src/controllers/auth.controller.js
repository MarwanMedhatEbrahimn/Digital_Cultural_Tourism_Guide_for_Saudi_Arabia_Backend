const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Admin Registration
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        admin_id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ admin_id: admin.admin_id, email: admin.email });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Login
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("Admin not found");
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    console.log(admin);

    // Check password
    const isPasswordValid = await comparePassword(password, admin.password);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password is not valid");
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken({ admin_id: admin.admin_id, email: admin.email });
    console.log("Token: ", token);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          admin_id: admin.admin_id,
          name: admin.name,
          email: admin.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Current Admin Profile
const getProfile = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { admin_id: req.admin.admin_id },
      select: {
        admin_id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Update Admin Profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const admin = await prisma.admin.update({
      where: { admin_id: req.admin.admin_id },
      data: updateData,
      select: {
        admin_id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    // Get admin with password
    const admin = await prisma.admin.findUnique({
      where: { admin_id: req.admin.admin_id },
    });

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.admin.update({
      where: { admin_id: req.admin.admin_id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
};
