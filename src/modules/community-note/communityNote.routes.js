const express = require('express');
const communityNoteController = require('./communityNote.controller');
const communityNoteValidator = require('./communityNote.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/community-notes:
 *   get:
 *     summary: Get all community notes with pagination and sorting
 *     tags: [Community Notes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [recent, popular]
 *           default: recent
 *         description: Sort by recent or popular
 *     responses:
 *       200:
 *         description: Community notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommunityNote'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create a new community note (authenticated)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - title
 *               - content
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: 'Quick Guide to Data Structures'
 *               content:
 *                 type: string
 *                 example: 'This is a comprehensive guide...'
 *     responses:
 *       201:
 *         description: Community note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityNote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', validate(communityNoteValidator.getAllCommunityNotesValidator), communityNoteController.getAllCommunityNotes);
router.post('/', authenticate, validate(communityNoteValidator.createCommunityNoteValidator), communityNoteController.createCommunityNote);

/**
 * @swagger
 * /api/community-notes/course/{courseId}:
 *   get:
 *     summary: Get all community notes for a specific course
 *     tags: [Community Notes]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [recent, popular]
 *           default: recent
 *     responses:
 *       200:
 *         description: Course notes retrieved successfully
 */
router.get('/course/:courseId', validate(communityNoteValidator.getCommunityNotesByCourseValidator), communityNoteController.getCommunityNotesByCourse);

/**
 * @swagger
 * /api/community-notes/user/{userId}:
 *   get:
 *     summary: Get all notes created by a specific user
 *     tags: [Community Notes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User notes retrieved successfully
 */
router.get('/user/:userId', validate(communityNoteValidator.getUserNotesValidator), communityNoteController.getUserNotes);

/**
 * @swagger
 * /api/community-notes/me:
 *   get:
 *     summary: Get current user's notes (authenticated)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User notes retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, validate(communityNoteValidator.getUserNotesValidator), communityNoteController.getMyNotes);

/**
 * @swagger
 * /api/community-notes/{id}:
 *   get:
 *     summary: Get a specific community note by ID
 *     tags: [Community Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommunityNote'
 *       404:
 *         description: Note not found
 *   put:
 *     summary: Update a community note (authenticated, author only)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to update this note
 *       404:
 *         description: Note not found
 *   delete:
 *     summary: Delete a community note (authenticated, author only)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to delete this note
 *       404:
 *         description: Note not found
 */
router.get('/:id', validate(communityNoteValidator.getCommunityNoteByIdValidator), communityNoteController.getCommunityNoteById);
router.put('/:id', authenticate, validate(communityNoteValidator.updateCommunityNoteValidator), communityNoteController.updateCommunityNote);
router.delete('/:id', authenticate, validate(communityNoteValidator.getCommunityNoteByIdValidator), communityNoteController.deleteCommunityNote);

/**
 * @swagger
 * /api/community-notes/{id}/pin:
 *   patch:
 *     summary: Toggle pin status of a note (Rep/Admin only)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPinned
 *             properties:
 *               isPinned:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Pin status updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Insufficient permissions (Rep/Admin required)
 *       404:
 *         description: Note not found
 */
router.patch('/:id/pin', authenticate, requireRep, validate(communityNoteValidator.togglePinValidator), communityNoteController.togglePin);

/**
 * @swagger
 * /api/community-notes/{id}/report:
 *   post:
 *     summary: Report a community note for review (authenticated)
 *     tags: [Community Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note reported successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Note not found
 */
router.post('/:id/report', authenticate, validate(communityNoteValidator.getCommunityNoteByIdValidator), communityNoteController.reportNote);

module.exports = router;
