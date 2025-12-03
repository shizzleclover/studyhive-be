const express = require('express');
const userController = require('./user.controller');
const userValidator = require('./user.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

// Public routes
router.get(
  '/:id',
  validate(userValidator.getUserByIdValidator),
  userController.getUserById
);

router.get(
  '/:id/stats',
  validate(userValidator.getUserByIdValidator),
  userController.getUserStats
);

// Protected routes (authenticated users)
router.put(
  '/profile',
  authenticate,
  validate(userValidator.updateProfileValidator),
  userController.updateProfile
);

router.post(
  '/notes/:noteId/save',
  authenticate,
  validate(userValidator.saveNoteValidator),
  userController.saveNote
);

router.delete(
  '/notes/:noteId/save',
  authenticate,
  validate(userValidator.saveNoteValidator),
  userController.unsaveNote
);

router.get(
  '/saved-notes',
  authenticate,
  validate(userValidator.getSavedNotesValidator),
  userController.getSavedNotes
);

// Admin only routes
router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(userValidator.getAllUsersValidator),
  userController.getAllUsers
);

router.patch(
  '/:id/role',
  authenticate,
  requireAdmin,
  validate(userValidator.updateUserRoleValidator),
  userController.updateUserRole
);

router.patch(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.deactivateUser
);

router.patch(
  '/:id/activate',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.activateUser
);

router.post(
  '/:id/assign-courses',
  authenticate,
  requireAdmin,
  validate(userValidator.assignCoursesValidator),
  userController.assignCourses
);

router.post(
  '/:id/update-reputation',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.updateReputation
);

module.exports = router;

