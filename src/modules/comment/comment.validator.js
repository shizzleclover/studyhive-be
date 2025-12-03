const Joi = require('joi');

const createCommentValidator = {
  params: Joi.object({
    noteId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    content: Joi.string().required().trim().max(1000),
  }),
};

const getCommentsByNoteValidator = {
  params: Joi.object({
    noteId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

const updateCommentValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    content: Joi.string().required().trim().max(1000),
  }),
};

const deleteCommentValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

module.exports = {
  createCommentValidator,
  getCommentsByNoteValidator,
  updateCommentValidator,
  deleteCommentValidator,
};
