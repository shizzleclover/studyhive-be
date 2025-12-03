const express = require('express');
const requestController = require('./request.controller');
const requestValidator = require('./request.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all requests with filtering and pagination
 *     tags: [Requests]
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
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: string
 *           enum: [past-question, official-note, community-note, quiz, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, fulfilled, rejected]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [recent, oldest, priority]
 *           default: priority
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 *   post:
 *     summary: Create a new request (authenticated)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - requestType
 *               - title
 *               - description
 *             properties:
 *               course:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *               requestType:
 *                 type: string
 *                 enum: [past-question, official-note, community-note, quiz, other]
 *                 example: 'past-question'
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: 'Need 2022 Exam Paper'
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: 'Looking for the 2022 first semester exam paper for this course'
 *               specificDetails:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: integer
 *                     example: 2022
 *                   semester:
 *                     type: string
 *                     enum: [First, Second, Both]
 *                     example: 'First'
 *                   topic:
 *                     type: string
 *                     example: 'Data Structures'
 *     responses:
 *       201:
 *         description: Request created successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', validate(requestValidator.getAllRequestsValidator), requestController.getAllRequests);
router.post('/', authenticate, validate(requestValidator.createRequestValidator), requestController.createRequest);

/**
 * @swagger
 * /api/requests/stats:
 *   get:
 *     summary: Get request statistics
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course ID to filter stats by course
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     in-progress:
 *                       type: integer
 *                     fulfilled:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 */
router.get('/stats', validate(requestValidator.getRequestStatsValidator), requestController.getRequestStats);

/**
 * @swagger
 * /api/requests/me:
 *   get:
 *     summary: Get authenticated user's requests
 *     tags: [Requests]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, fulfilled, rejected]
 *     responses:
 *       200:
 *         description: User requests retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, validate(requestValidator.getUserRequestsValidator), requestController.getUserRequests);

/**
 * @swagger
 * /api/requests/course/{courseId}:
 *   get:
 *     summary: Get all requests for a specific course
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, fulfilled, rejected]
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: string
 *           enum: [past-question, official-note, community-note, quiz, other]
 *     responses:
 *       200:
 *         description: Course requests retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/course/:courseId', validate(requestValidator.getRequestsByCourseValidator), requestController.getRequestsByCourse);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get a specific request by ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update a request (author only, pending requests only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               specificDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized or request not pending
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete a request (author only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to delete this request
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validate(requestValidator.getRequestByIdValidator), requestController.getRequestById);
router.put('/:id', authenticate, validate(requestValidator.updateRequestValidator), requestController.updateRequest);
router.delete('/:id', authenticate, validate(requestValidator.getRequestByIdValidator), requestController.deleteRequest);

/**
 * @swagger
 * /api/requests/{id}/vote:
 *   post:
 *     summary: Vote on a request to increase/decrease priority (authenticated)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voteType
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote]
 *                 example: 'upvote'
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/vote', authenticate, validate(requestValidator.voteOnRequestValidator), requestController.voteOnRequest);

/**
 * @swagger
 * /api/requests/{id}/in-progress:
 *   patch:
 *     summary: Mark request as in progress (Rep/Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request marked as in progress
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/in-progress', authenticate, requireRep, validate(requestValidator.getRequestByIdValidator), requestController.markInProgress);

/**
 * @swagger
 * /api/requests/{id}/fulfill:
 *   patch:
 *     summary: Fulfill a request (Rep/Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: 'Uploaded the requested past question'
 *               resourceId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *               resourceType:
 *                 type: string
 *                 enum: [PastQuestion, OfficialNote, CommunityNote, Quiz]
 *     responses:
 *       200:
 *         description: Request fulfilled successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/fulfill', authenticate, requireRep, validate(requestValidator.fulfillRequestValidator), requestController.fulfillRequest);

/**
 * @swagger
 * /api/requests/{id}/reject:
 *   patch:
 *     summary: Reject a request (Rep/Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: 'This material is not available'
 *     responses:
 *       200:
 *         description: Request rejected
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/reject', authenticate, requireRep, validate(requestValidator.rejectRequestValidator), requestController.rejectRequest);

module.exports = router;
