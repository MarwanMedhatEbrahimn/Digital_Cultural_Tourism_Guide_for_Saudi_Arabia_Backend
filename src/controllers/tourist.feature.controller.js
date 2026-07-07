const prisma = require('../config/database');

// --- Likes Feature ---

// Toggle Like
const toggleLike = async (req, res, next) => {
  try {
    const { place_id } = req.body;
    const tourist_id = req.tourist.tourist_id;

    if (!place_id) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required',
      });
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { place_id: parseInt(place_id) },
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found',
      });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        tourist_id_place_id: {
          tourist_id,
          place_id: parseInt(place_id),
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          tourist_id_place_id: {
            tourist_id,
            place_id: parseInt(place_id),
          },
        },
      });
      return res.status(200).json({
        success: true,
        message: 'Place unliked successfully',
        liked: false,
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          tourist_id,
          place_id: parseInt(place_id),
        },
      });
      return res.status(200).json({
        success: true,
        message: 'Place liked successfully',
        liked: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get My Liked Places
const getMyLikes = async (req, res, next) => {
  try {
    const tourist_id = req.tourist.tourist_id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { tourist_id },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          place: {
            include: {
              city: {
                select: {
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.like.count({ where: { tourist_id } }),
    ]);

    // Transform response to return list of places
    const places = likes.map(like => like.place);

    res.status(200).json({
      success: true,
      data: places,
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

// --- Activities Feature ---

// Add Activity
const addActivity = async (req, res, next) => {
  try {
    const { day_number, description } = req.body;
    const tourist_id = req.tourist.tourist_id;

    if (!day_number || !description) {
      return res.status(400).json({
        success: false,
        message: 'Day number and description are required',
      });
    }

    const activity = await prisma.activity.create({
      data: {
        day_number: parseInt(day_number),
        description,
        tourist_id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Activities
const getMyActivities = async (req, res, next) => {
  try {
    const tourist_id = req.tourist.tourist_id;

    const activities = await prisma.activity.findMany({
      where: { tourist_id },
      orderBy: {
        day_number: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Activity
const deleteActivity = async (req, res, next) => {
  try {
    const { activity_id } = req.params;
    const tourist_id = req.tourist.tourist_id;

    // Verify ownership
    const activity = await prisma.activity.findFirst({
      where: {
        activity_id: parseInt(activity_id),
        tourist_id,
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized',
      });
    }

    await prisma.activity.delete({
      where: { activity_id: parseInt(activity_id) },
    });

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// --- Quiz Feature ---

// Submit Quiz Answers
// Logic: Calculate the most frequent 'sug_des_id' from the selected options and return that destination
const submitQuiz = async (req, res, next) => {
  try {
    const { option_ids } = req.body; // Array of option IDs

    if (!option_ids || !Array.isArray(option_ids) || option_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a list of option_ids',
      });
    }

    // Fetch options with their suggested destinations
    const options = await prisma.option.findMany({
      where: {
        option_id: {
          in: option_ids.map(id => parseInt(id)),
        },
      },
      select: {
        option_id: true,
        sug_des_id: true,
        suggestedDestination: true,
      },
    });

    if (options.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid options provided',
      });
    }

    // Count frequency of each suggested destination
    const destinationCounts = {};
    options.forEach(opt => {
      if (opt.sug_des_id) {
        destinationCounts[opt.sug_des_id] = (destinationCounts[opt.sug_des_id] || 0) + 1;
      }
    });

    // Find the max count
    let maxCount = 0;
    let winningDestId = null;

    for (const [id, count] of Object.entries(destinationCounts)) {
      if (count > maxCount) {
        maxCount = count;
        winningDestId = id;
      }
    }

    if (!winningDestId) {
       return res.status(200).json({
        success: true,
        message: 'No specific destination suggestion based on your answers',
        data: null
      });
    }

    // Retrieve full destination details
    const suggestedDestination = await prisma.suggestedDestination.findUnique({
      where: { sug_des_id: parseInt(winningDestId) },
    });

    res.status(200).json({
      success: true,
      message: 'Quiz calculated successfully',
      data: suggestedDestination,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  getMyLikes,
  addActivity,
  getMyActivities,
  deleteActivity,
  submitQuiz,
};
