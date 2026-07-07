const prisma = require('../config/database');
const { filesToUrls, deleteFiles } = require('../middlewares/upload.middleware');

// Create Place
const createPlace = async (req, res, next) => {
  try {
    const {
      name,
      name_ar,
      description,
      description_ar,
      location,
      location_ar,
      cate_id,
      city_id,
    } = req.body;
    const admin_id = req.admin.admin_id;

    // Verify category and city exist
    const [categoryExists, cityExists] = await Promise.all([
      prisma.category.findUnique({ where: { cate_id: parseInt(cate_id) } }),
      prisma.city.findUnique({ where: { city_id: parseInt(city_id) } }),
    ]);

    if (!categoryExists && !cityExists) {
      return res.status(404).json({
        success: false,
        message: 'Category and City not found',
      });
    }
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    if (!cityExists) {
      return res.status(404).json({
        success: false,
        message: 'City not found',
      });
    }

    // Check for duplicate place name
    const existingPlace = await prisma.place.findFirst({ where: { name } });
    if (existingPlace) {
      return res.status(400).json({
        success: false,
        message: 'Place with this name already exists',
      });
    }

    const imageUrls = filesToUrls(req.files);

    const place = await prisma.place.create({
      data: {
        name,
        name_ar: name_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        location: location || null,
        location_ar: location_ar || null,
        admin_id,
        cate_id: parseInt(cate_id),
        city_id: parseInt(city_id),
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
        admin: {
          select: { admin_id: true, name: true },
        },
        category: {
          select: { cate_id: true, name: true, name_ar: true },
        },
        city: {
          select: { city_id: true, name: true, name_ar: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Place created successfully',
      data: place,
    });
  } catch (error) {
    next(error);
  }
};

// Optional tourist_id query: attach liked + tourist_id to each place (same payload as usual otherwise).
const attachLikeStatusForTourist = async (places, touristId) => {
  if (!places.length) return [];
  const ids = places.map((p) => p.place_id);
  const likes = await prisma.like.findMany({
    where: {
      tourist_id: touristId,
      place_id: { in: ids },
    },
    select: { place_id: true },
  });
  const likedSet = new Set(likes.map((l) => l.place_id));
  return places.map((p) => ({
    ...p,
    tourist_id: touristId,
    liked: likedSet.has(p.place_id),
  }));
};

// Get All Places
const getAllPlaces = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, city_id, cate_id, search, tourist_id } = req.query;
    const skip = (page - 1) * limit;
    const touristIdParsed = tourist_id !== undefined && tourist_id !== '' ? parseInt(tourist_id, 10) : null;
    const withTouristLike =
      touristIdParsed !== null && !Number.isNaN(touristIdParsed) && touristIdParsed >= 1;

    const where = {};
    if (city_id) where.city_id = parseInt(city_id);
    if (cate_id) where.cate_id = parseInt(cate_id);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { name_ar: { contains: search } },
      ];
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          images: true,
          admin: {
            select: { admin_id: true, name: true },
          },
          category: {
            select: { cate_id: true, name: true, name_ar: true },
          },
          city: {
            select: { city_id: true, name: true, name_ar: true },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.place.count({ where }),
    ]);

    const data = withTouristLike
      ? await attachLikeStatusForTourist(places, touristIdParsed)
      : places;

    res.status(200).json({
      success: true,
      data,
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

// Get Place by ID
const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tourist_id } = req.query;
    const touristIdParsed =
      tourist_id !== undefined && tourist_id !== '' ? parseInt(tourist_id, 10) : null;
    const withTouristLike =
      touristIdParsed !== null && !Number.isNaN(touristIdParsed) && touristIdParsed >= 1;

    const includeBase = {
      images: true,
      admin: {
        select: { admin_id: true, name: true },
      },
      category: true,
      city: {
        include: { images: true },
      },
    };

    const place = await prisma.place.findUnique({
      where: { place_id: parseInt(id) },
      include: withTouristLike
        ? includeBase
        : {
            ...includeBase,
            likes: {
              include: {
                tourist: {
                  select: { tourist_id: true, name: true, email: true },
                },
              },
            },
          },
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found',
      });
    }

    let data = place;

    if (withTouristLike) {
      const like = await prisma.like.findUnique({
        where: {
          tourist_id_place_id: {
            tourist_id: touristIdParsed,
            place_id: place.place_id,
          },
        },
      });
      data = {
        ...place,
        tourist_id: touristIdParsed,
        liked: !!like,
      };
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Update Place
const updatePlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      name_ar,
      description,
      description_ar,
      location,
      location_ar,
      cate_id,
      city_id,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (name_ar !== undefined) updateData.name_ar = name_ar || null;
    if (description !== undefined) updateData.description = description || null;
    if (description_ar !== undefined) updateData.description_ar = description_ar || null;
    if (location !== undefined) updateData.location = location || null;
    if (location_ar !== undefined) updateData.location_ar = location_ar || null;

    if (cate_id) {
      const categoryExists = await prisma.category.findUnique({
        where: { cate_id: parseInt(cate_id) },
      });
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
      updateData.cate_id = parseInt(cate_id);
    }

    if (city_id) {
      const cityExists = await prisma.city.findUnique({
        where: { city_id: parseInt(city_id) },
      });
      if (!cityExists) {
        return res.status(404).json({
          success: false,
          message: 'City not found',
        });
      }
      updateData.city_id = parseInt(city_id);
    }

    // Handle new images if uploaded
    const imageUrls = filesToUrls(req.files);
    if (imageUrls.length > 0) {
      const existing = await prisma.placeImage.findMany({
        where: { place_id: parseInt(id) },
      });
      deleteFiles(existing.map((img) => img.url));

      await prisma.placeImage.deleteMany({ where: { place_id: parseInt(id) } });
      updateData.images = {
        create: imageUrls.map((url) => ({ url })),
      };
    }

    const place = await prisma.place.update({
      where: { place_id: parseInt(id) },
      data: updateData,
      include: {
        images: true,
        admin: {
          select: { admin_id: true, name: true },
        },
        category: {
          select: { cate_id: true, name: true, name_ar: true },
        },
        city: {
          select: { city_id: true, name: true, name_ar: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Place updated successfully',
      data: place,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Place
const deletePlace = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete image files from disk
    const images = await prisma.placeImage.findMany({
      where: { place_id: parseInt(id) },
    });
    deleteFiles(images.map((img) => img.url));

    await prisma.place.delete({
      where: { place_id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Place deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
};
