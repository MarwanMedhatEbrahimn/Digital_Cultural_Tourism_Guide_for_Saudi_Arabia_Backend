const prisma = require('../config/database');

// Create Suggested Destination
const createSuggestedDestination = async (req, res, next) => {
  try {
    const { topic, description } = req.body;
    const admin_id = req.admin.admin_id;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    const suggestedDestination = await prisma.suggestedDestination.create({
      data: {
        topic,
        description,
        admin_id,
      },
      include: {
        admin: {
          select: {
            admin_id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Suggested destination created successfully',
      data: suggestedDestination,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Suggested Destinations
const getAllSuggestedDestinations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { topic: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const [destinations, total] = await Promise.all([
      prisma.suggestedDestination.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          admin: {
            select: {
              admin_id: true,
              name: true,
            },
          },
          _count: {
            select: {
              options: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.suggestedDestination.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: destinations,
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

// Get Suggested Destination by ID
const getSuggestedDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await prisma.suggestedDestination.findUnique({
      where: { sug_des_id: parseInt(id) },
      include: {
        admin: {
          select: {
            admin_id: true,
            name: true,
          },
        },
        options: {
          include: {
            question: {
              select: {
                ques_id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Suggested destination not found',
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Update Suggested Destination
const updateSuggestedDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { topic, description } = req.body;

    const updateData = {};
    if (topic) updateData.topic = topic;
    if (description !== undefined) updateData.description = description;

    const destination = await prisma.suggestedDestination.update({
      where: { sug_des_id: parseInt(id) },
      data: updateData,
      include: {
        admin: {
          select: {
            admin_id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Suggested destination updated successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Suggested Destination
const deleteSuggestedDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Guard: refuse if any option references this suggestion
    const optionCount = await prisma.option.count({
      where: { sug_des_id: parseInt(id) },
    });
    if (optionCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete this suggestion because it is currently used by ${optionCount} option(s). Remove it from all options first.`,
      });
    }

    await prisma.suggestedDestination.delete({
      where: { sug_des_id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Suggested destination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSuggestedDestination,
  getAllSuggestedDestinations,
  getSuggestedDestinationById,
  updateSuggestedDestination,
  deleteSuggestedDestination,
};
