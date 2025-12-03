const express = require('express');
const userController = require('./user.controller');
const userValidator = require('./user.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
// Public routes
router.get(
  '/:id',
  validate(userValidator.getUserByIdValidator),
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: User stats retrieved
 */
router.get(
  '/:id/stats',
  validate(userValidator.getUserByIdValidator),
  userController.getUserStats
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 description: Optional profile picture URL
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
// Protected routes (authenticated users)
router.put(
  '/profile',
  authenticate,
  validate(userValidator.updateProfileValidator),
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/notes/{noteId}/save:
 *   post:
 *     summary: Save a community note
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note saved
 */
router.post(
  '/notes/:noteId/save',
  authenticate,
  validate(userValidator.saveNoteValidator),
  userController.saveNote
);

/**
 * @swagger
 * /api/users/notes/{noteId}/save:
 *   delete:
 *     summary: Unsave a community note
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note unsaved
 */
router.delete(
  '/notes/:noteId/save',
  authenticate,
  validate(userValidator.saveNoteValidator),
  userController.unsaveNote
);

/**
 * @swagger
 * /api/users/saved-notes:
 *   get:
 *     summary: Get current user's saved notes
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved notes retrieved
 */
router.get(
  '/saved-notes',
  authenticate,
  validate(userValidator.getSavedNotesValidator),
  userController.getSavedNotes
);

// Admin only routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(userValidator.getAllUsersValidator),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/role',
  authenticate,
  requireAdmin,
  validate(userValidator.updateUserRoleValidator),
  userController.updateUserRole
);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.deactivateUser
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/activate',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.activateUser
);

/**
 * @swagger
 * /api/users/{id}/assign-courses:
 *   post:
 *     summary: Assign courses to a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/assign-courses',
  authenticate,
  requireAdmin,
  validate(userValidator.assignCoursesValidator),
  userController.assignCourses
);

/**
 * @swagger
 * /api/users/{id}/update-reputation:
 *   post:
 *     summary: Update user reputation score (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/update-reputation',
  authenticate,
  requireAdmin,
  validate(userValidator.getUserByIdValidator),
  userController.updateReputation
);

module.exports = router;

