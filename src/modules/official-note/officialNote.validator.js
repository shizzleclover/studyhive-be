const Joi = require('joi');

const createOfficialNoteValidator = {
  body: Joi.object({
    course: Joi.string().hex().length(24).required(),
    title: Joi.string().required().trim(),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid('Lecture Notes', 'Slides', 'Textbook', 'Reference Material', 'Other').default('Lecture Notes'),
    fileKey: Joi.string().required(),
    fileUrl: Joi.string().uri().required(),
    fileName: Joi.string().required(),
    fileSize: Joi.number().required(),
    fileType: Joi.string().required(),
  }),
};

const updateOfficialNoteValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    course: Joi.string().hex().length(24),
    title: Joi.string().trim(),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid('Lecture Notes', 'Slides', 'Textbook', 'Reference Material', 'Other'),
    isActive: Joi.boolean(),
  }).min(1),
};

const getOfficialNoteByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getAllOfficialNotesValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    course: Joi.string().hex().length(24),
    category: Joi.string(),
    search: Joi.string().max(100),
  }),
};

const getOfficialNotesByCourseValidator = {
  params: Joi.object({
    courseId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string(),
  }),
};

module.exports = {
  createOfficialNoteValidator,
  updateOfficialNoteValidator,
  getOfficialNoteByIdValidator,
  getAllOfficialNotesValidator,
  getOfficialNotesByCourseValidator,
};

