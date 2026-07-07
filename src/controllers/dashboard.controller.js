const prisma = require('../config/database');

// Get Dashboard Stats
const getStats = async (req, res, next) => {
  try {
    const [cities, places, categories] = await Promise.all([
      prisma.city.count(),
      prisma.place.count(),
      prisma.category.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cities,
        places,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
