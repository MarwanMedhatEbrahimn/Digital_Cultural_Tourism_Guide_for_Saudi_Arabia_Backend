const prisma = require('../config/database');

// Create Question
const createQuestion = async (req, res, next) => {
  try {
    const { text } = req.body;
    const admin_id = req.admin.admin_id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required',
      });
    }

    const question = await prisma.question.create({
      data: {
        text,
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
      message: 'Question created successfully',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Questions
const getAllQuestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          admin: {
            select: {
              admin_id: true,
              name: true,
            },
          },
          options: {
            include: {
              suggestedDestination: {
                select: {
                  sug_des_id: true,
                  topic: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.question.count(),
    ]);

    res.status(200).json({
      success: true,
      data: questions,
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

// Get Question by ID
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { ques_id: parseInt(id) },
      include: {
        admin: {
          select: {
            admin_id: true,
            name: true,
          },
        },
        options: {
          include: {
            suggestedDestination: true,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// Update Question
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required',
      });
    }

    const question = await prisma.question.update({
      where: { ques_id: parseInt(id) },
      data: { text },
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
      message: 'Question updated successfully',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.question.delete({
      where: { ques_id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Create Option for Question
const createOption = async (req, res, next) => {
  try {
    const { ques_id } = req.params;
    const { text, sug_des_id } = req.body;
    const admin_id = req.admin.admin_id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Option text is required',
      });
    }

    // Verify question exists
    const questionExists = await prisma.question.findUnique({
      where: { ques_id: parseInt(ques_id) },
    });

    if (!questionExists) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Verify suggested destination exists if provided
    if (sug_des_id) {
      const sugDestExists = await prisma.suggestedDestination.findUnique({
        where: { sug_des_id: parseInt(sug_des_id) },
      });

      if (!sugDestExists) {
        return res.status(404).json({
          success: false,
          message: 'Suggested destination not found',
        });
      }
    }

    const option = await prisma.option.create({
      data: {
        text,
        admin_id,
        ques_id: parseInt(ques_id),
        sug_des_id: sug_des_id ? parseInt(sug_des_id) : null,
      },
      include: {
        question: {
          select: {
            ques_id: true,
            text: true,
          },
        },
        suggestedDestination: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Option created successfully',
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Option
const deleteOption = async (req, res, next) => {
  try {
    const { option_id } = req.params;

    await prisma.option.delete({
      where: { option_id: parseInt(option_id) },
    });

    res.status(200).json({
      success: true,
      message: 'Option deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createOption,
  deleteOption,
};
