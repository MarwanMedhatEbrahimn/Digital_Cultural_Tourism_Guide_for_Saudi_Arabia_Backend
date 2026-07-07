const prisma = require('../config/database');
const { filesToUrls, deleteFiles } = require('../middlewares/upload.middleware');

// Create City
const createCity = async (req, res, next) => {
  try {
    const { name, name_ar, description, description_ar } = req.body;
    const admin_id = req.admin.admin_id;

    const imageUrls = filesToUrls(req.files);

    const city = await prisma.city.create({
      data: {
        name,
        name_ar: name_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        admin_id,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        admin: {
          select: { admin_id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: city,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Cities
const getAllCities = async (req, res, next) => {
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

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where: where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          images: true,
          places: true,
          cityCategories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              cityCategories: true,
              places: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.city.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: cities,
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

// Get City by ID
const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const city = await prisma.city.findUnique({
      where: { city_id: parseInt(id) },
      include: {
        images: true,
        admin: {
          select: { admin_id: true, name: true },
        },
        cityCategories: {
          include: {
            category: {
              include: {
                _count: { select: { places: true } },
              },
            },
          },
        },
        places: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { images: true },
        },
      },
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found',
      });
    }

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    next(error);
  }
};

// Update City
const updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, name_ar, description, description_ar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (name_ar !== undefined) updateData.name_ar = name_ar || null;
    if (description !== undefined) updateData.description = description || null;
    if (description_ar !== undefined) updateData.description_ar = description_ar || null;

    // Handle new images if uploaded
    const imageUrls = filesToUrls(req.files);
    if (imageUrls.length > 0) {
      // Fetch existing images so we can delete them from disk
      const existing = await prisma.cityImage.findMany({
        where: { city_id: parseInt(id) },
      });
      deleteFiles(existing.map((img) => img.url));

      // Replace all existing images
      await prisma.cityImage.deleteMany({ where: { city_id: parseInt(id) } });
      updateData.images = {
        create: imageUrls.map((url) => ({ url })),
      };
    }

    const city = await prisma.city.update({
      where: { city_id: parseInt(id) },
      data: updateData,
      include: {
        images: true,
        admin: {
          select: { admin_id: true, name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'City updated successfully',
      data: city,
    });
  } catch (error) {
    next(error);
  }
};

// Delete City
const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Refuse if any place references this city
    const placeCount = await prisma.place.count({
      where: { city_id: parseInt(id) },
    });
    if (placeCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete this city because it has ${placeCount} place(s) assigned to it. Remove or reassign all places first.`,
      });
    }

    // Delete image files from disk
    const images = await prisma.cityImage.findMany({
      where: { city_id: parseInt(id) },
    });
    deleteFiles(images.map((img) => img.url));

    await prisma.city.delete({
      where: { city_id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'City deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get Categories by City
const getCategoriesByCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const city = await prisma.city.findUnique({
      where: { city_id: parseInt(id) },
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found',
      });
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: {
          cityCategories: { some: { city_id: parseInt(id) } },
        },
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
      prisma.category.count({
        where: {
          cityCategories: { some: { city_id: parseInt(id) } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { city, categories },
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

// Add Category to City
const addCategoryToCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cate_id } = req.body;

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { city_id: parseInt(id) },
    });
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found',
      });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { cate_id: parseInt(cate_id) },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Upsert to avoid duplicates
    const cityCategory = await prisma.cityCategory.upsert({
      where: {
        city_id_cate_id: {
          city_id: parseInt(id),
          cate_id: parseInt(cate_id),
        },
      },
      create: {
        city_id: parseInt(id),
        cate_id: parseInt(cate_id),
      },
      update: {},
    });

    res.status(201).json({
      success: true,
      message: 'Category added to city successfully',
      data: cityCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
  getCategoriesByCity,
  addCategoryToCity,
};
