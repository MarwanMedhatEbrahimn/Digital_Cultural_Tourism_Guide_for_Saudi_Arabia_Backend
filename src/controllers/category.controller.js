const prisma = require('../config/database');

// Create Category
const createCategory = async (req, res, next) => {
  try {
    const { name, name_ar } = req.body;
    const admin_id = req.admin.admin_id;

    const category = await prisma.category.create({
      data: {
        name,
        name_ar: name_ar || null,
        admin_id,
      },
      include: {
        admin: {
          select: { admin_id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Categories
const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { name_ar: { contains: search } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          admin: {
            select: { admin_id: true, name: true },
          },
          _count: {
            select: { places: true, cityCategories: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { cate_id: parseInt(id) },
      include: {
        admin: {
          select: { admin_id: true, name: true },
        },
        cityCategories: {
          include: {
            city: {
              select: {
                city_id: true,
                name: true,
                name_ar: true,
                description: true,
                description_ar: true,
              },
            },
          },
        },
        places: {
          orderBy: { createdAt: 'desc' },
          include: { images: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Update Category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, name_ar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (name_ar !== undefined) updateData.name_ar = name_ar || null;

    const category = await prisma.category.update({
      where: { cate_id: parseInt(id) },
      data: updateData,
      include: {
        admin: {
          select: { admin_id: true, name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Refuse if any place or city references this category
    const [placeCount, cityCount] = await Promise.all([
      prisma.place.count({ where: { cate_id: parseInt(id) } }),
      prisma.cityCategory.count({ where: { cate_id: parseInt(id) } }),
    ]);
    if (placeCount > 0 || cityCount > 0) {
      const reasons = [];
      if (cityCount > 0) reasons.push(`${cityCount} city(ies)`);
      if (placeCount > 0) reasons.push(`${placeCount} place(s)`);
      return res.status(409).json({
        success: false,
        message: `Cannot delete this category because it is assigned to ${reasons.join(' and ')}. Remove all assignments first.`,
      });
    }

    await prisma.category.delete({
      where: { cate_id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Assign Category to Cities
const assignCategoryToCities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city_ids } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { cate_id: parseInt(id) },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if all cities exist
    const cities = await prisma.city.findMany({
      where: { city_id: { in: city_ids.map((cid) => parseInt(cid)) } },
    });
    if (cities.length !== city_ids.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more cities not found',
      });
    }

    // Create city-category relationships (ignore duplicates)
    const cityCategories = await Promise.all(
      city_ids.map((city_id) =>
        prisma.cityCategory.upsert({
          where: {
            city_id_cate_id: {
              city_id: parseInt(city_id),
              cate_id: parseInt(id),
            },
          },
          create: {
            city_id: parseInt(city_id),
            cate_id: parseInt(id),
          },
          update: {},
        }),
      ),
    );

    res.status(200).json({
      success: true,
      message: 'Category assigned to cities successfully',
      data: cityCategories,
    });
  } catch (error) {
    next(error);
  }
};

// Remove Category from Cities
const removeCategoryFromCities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city_ids } = req.body;

    await prisma.cityCategory.deleteMany({
      where: {
        cate_id: parseInt(id),
        city_id: { in: city_ids.map((cid) => parseInt(cid)) },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Category removed from cities successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get Cities by Category
const getCitiesByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { cate_id: parseInt(id) },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where: {
          cityCategories: { some: { cate_id: parseInt(id) } },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          images: true,
          admin: {
            select: { admin_id: true, name: true },
          },
          _count: {
            select: { places: true, cityCategories: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.city.count({
        where: {
          cityCategories: { some: { cate_id: parseInt(id) } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { category, cities },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  assignCategoryToCities,
  removeCategoryFromCities,
  getCitiesByCategory,
};
