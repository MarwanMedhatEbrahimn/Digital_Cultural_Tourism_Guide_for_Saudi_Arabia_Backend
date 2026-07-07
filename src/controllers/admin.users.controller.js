const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');

const touristAdminSelect = {
  tourist_id: true,
  name: true,
  email: true,
  admin_id: true,
  createdAt: true,
  updatedAt: true,
  admin: {
    select: { admin_id: true, name: true, email: true },
  },
  _count: {
    select: { likes: true, activities: true },
  },
};

// List tourists (app users) for admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.tourist.findMany({
        where,
        skip,
        take: Number(limit),
        select: touristAdminSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourist.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Single tourist for admin detail / edit form
const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const user = await prisma.tourist.findUnique({
      where: { tourist_id: id },
      select: touristAdminSelect,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update tourist profile (admin)
const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, password } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update: name, email, or password.',
      });
    }

    const user = await prisma.tourist.update({
      where: { tourist_id: id },
      data: updateData,
      select: touristAdminSelect,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};
