const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    
    // Check for Admin
    if (decoded.admin_id) {
      const admin = await prisma.admin.findUnique({
        where: { admin_id: decoded.admin_id },
        select: {
          admin_id: true,
          name: true,
          email: true,
        },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found. Authorization denied.',
        });
      }

      req.admin = admin;
      req.userRole = 'admin';
      return next();
    }

    // Check for Tourist
    if (decoded.tourist_id) {
      const tourist = await prisma.tourist.findUnique({
        where: { tourist_id: decoded.tourist_id },
        select: {
          tourist_id: true,
          name: true,
          email: true,
        },
      });

      if (!tourist) {
        return res.status(401).json({
          success: false,
          message: 'Tourist not found. Authorization denied.',
        });
      }

      req.tourist = tourist;
      req.userRole = 'tourist';
      return next();
    }

    // If neither ID is present (invalid token structure)
    return res.status(401).json({
      success: false,
      message: 'Invalid token payload. Authorization denied.',
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization denied.',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
