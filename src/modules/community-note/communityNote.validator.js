const Joi = require('joi');

const createCommunityNoteValidator = {
  body: Joi.object({
    course: Joi.string().hex().length(24).required(),
    title: Joi.string().required().trim().max(200),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).max(10),
  }),
};

const updateCommunityNoteValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    title: Joi.string().trim().max(200),
    content: Joi.string(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).max(10),
  }).min(1),
};

const getCommunityNoteByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getAllCommunityNotesValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    course: Joi.string().hex().length(24),
    author: Joi.string().hex().length(24),
    tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    search: Joi.string().max(100),
    sortBy: Joi.string().valid('recent', 'popular'),
  }),
};

const getCommunityNotesByCourseValidator = {
  params: Joi.object({
    courseId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    sortBy: Joi.string().valid('recent', 'popular'),
  }),
};

const togglePinValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    isPinned: Joi.boolean().required(),
  }),
};

const getUserNotesValidator = {
  params: Joi.object({
    userId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = {
  createCommunityNoteValidator,
  updateCommunityNoteValidator,
  getCommunityNoteByIdValidator,
  getAllCommunityNotesValidator,
  getCommunityNotesByCourseValidator,
  togglePinValidator,
  getUserNotesValidator,
};
