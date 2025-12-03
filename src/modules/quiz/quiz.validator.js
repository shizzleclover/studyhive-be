const Joi = require('joi');

const questionSchema = Joi.object({
  questionText: Joi.string().trim().required().messages({
    'any.required': 'Question text is required',
    'string.empty': 'Question text cannot be empty',
  }),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required().messages({
          'any.required': 'Option text is required',
          'string.empty': 'Option text cannot be empty',
        }),
        isCorrect: Joi.boolean().required(),
      })
    )
    .min(2)
    .max(6)
    .required()
    .messages({
      'array.min': 'Each question must have at least 2 options',
      'array.max': 'Each question cannot have more than 6 options',
    }),
  explanation: Joi.string().trim().allow(''),
  points: Joi.number().integer().min(1).default(1),
});

const createQuizValidator = {
  body: Joi.object({
    course: Joi.string().hex().length(24).required().messages({
      'any.required': 'Course ID is required',
      'string.hex': 'Invalid course ID format',
      'string.length': 'Invalid course ID format',
    }),
    title: Joi.string().trim().max(200).required().messages({
      'any.required': 'Quiz title is required',
      'string.max': 'Title must not exceed 200 characters',
    }),
    description: Joi.string().trim().max(1000).allow(''),
    questions: Joi.array().items(questionSchema).min(1).required().messages({
      'array.min': 'Quiz must have at least one question',
      'any.required': 'Questions are required',
    }),
    timeLimit: Joi.number().integer().min(1).allow(null),
    passingScore: Joi.number().integer().min(0).max(100).default(50),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium'),
    shuffleQuestions: Joi.boolean().default(false),
    shuffleOptions: Joi.boolean().default(false),
    allowReview: Joi.boolean().default(true),
    maxAttempts: Joi.number().integer().min(1).allow(null),
    isPublished: Joi.boolean().default(false),
  }),
};

const updateQuizValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid quiz ID format',
      'string.length': 'Invalid quiz ID format',
    }),
  }),
  body: Joi.object({
    title: Joi.string().trim().max(200),
    description: Joi.string().trim().max(1000).allow(''),
    questions: Joi.array().items(questionSchema).min(1),
    timeLimit: Joi.number().integer().min(1).allow(null),
    passingScore: Joi.number().integer().min(0).max(100),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
    shuffleQuestions: Joi.boolean(),
    shuffleOptions: Joi.boolean(),
    allowReview: Joi.boolean(),
    maxAttempts: Joi.number().integer().min(1).allow(null),
    isActive: Joi.boolean(),
    isPublished: Joi.boolean(),
  }),
};

const getQuizByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid quiz ID format',
      'string.length': 'Invalid quiz ID format',
    }),
  }),
};

const getAllQuizzesValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    courseId: Joi.string().hex().length(24),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
    published: Joi.string().valid('true', 'false'),
    isActive: Joi.string().valid('true', 'false'),
  }),
};

const getQuizzesByCourseValidator = {
  params: Joi.object({
    courseId: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid course ID format',
      'string.length': 'Invalid course ID format',
    }),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
  }),
};

const submitQuizAttemptValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid quiz ID format',
      'string.length': 'Invalid quiz ID format',
    }),
  }),
  body: Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().hex().length(24).required(),
          selectedOptionIndex: Joi.number().integer().min(0).required(),
        })
      )
      .required()
      .messages({
        'any.required': 'Answers are required',
      }),
    timeSpent: Joi.number().integer().min(0).required().messages({
      'any.required': 'Time spent is required',
      'number.min': 'Time spent cannot be negative',
    }),
  }),
};

const getUserQuizAttemptsValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid quiz ID format',
      'string.length': 'Invalid quiz ID format',
    }),
  }),
};

const getAllUserAttemptsValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

const getAttemptDetailsValidator = {
  params: Joi.object({
    attemptId: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid attempt ID format',
      'string.length': 'Invalid attempt ID format',
    }),
  }),
};

const togglePublishValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid quiz ID format',
      'string.length': 'Invalid quiz ID format',
    }),
  }),
  body: Joi.object({
    isPublished: Joi.boolean().required().messages({
      'any.required': 'isPublished field is required',
    }),
  }),
};

module.exports = {
  createQuizValidator,
  updateQuizValidator,
  getQuizByIdValidator,
  getAllQuizzesValidator,
  getQuizzesByCourseValidator,
  submitQuizAttemptValidator,
  getUserQuizAttemptsValidator,
  getAllUserAttemptsValidator,
  getAttemptDetailsValidator,
  togglePublishValidator,
};
