const express = require('express');
const voteController = require('./vote.controller');
const { authenticate } = require('../../shared/middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/votes:
 *   post:
 *     summary: Cast or update a vote on a note or comment (authenticated)
 *     description: Creates a new vote or updates an existing vote. If the user already voted with the same type, the vote is removed.
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - entityId
 *               - voteType
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [note, comment]
 *                 example: 'note'
 *                 description: Type of entity being voted on
 *               entityId:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *                 description: ID of the entity being voted on
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote]
 *                 example: 'upvote'
 *                 description: Type of vote (upvote or downvote)
 *     responses:
 *       200:
 *         description: Vote cast or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 'Vote cast successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Vote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Entity not found
 *   delete:
 *     summary: Remove a vote (authenticated)
 *     description: Removes user's vote from a specific entity
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [note, comment]
 *         description: Type of entity
 *       - in: query
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: Vote removed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Vote not found
 */
router.post('/', authenticate, voteController.castVote);
router.delete('/', authenticate, voteController.removeVote);

/**
 * @swagger
 * /api/votes/user:
 *   get:
 *     summary: Get user's vote on a specific entity (authenticated)
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [note, comment]
 *         description: Type of entity
 *       - in: query
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: User vote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Vote'
 *                     - type: 'null'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/user', authenticate, voteController.getUserVote);

/**
 * @swagger
 * /api/votes/counts:
 *   get:
 *     summary: Get vote counts for a specific entity
 *     tags: [Votes]
 *     parameters:
 *       - in: query
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [note, comment]
 *         description: Type of entity
 *       - in: query
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: Vote counts retrieved successfully
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
 *                     upvotes:
 *                       type: integer
 *                       example: 25
 *                     downvotes:
 *                       type: integer
 *                       example: 3
 *                     score:
 *                       type: integer
 *                       example: 22
 */
router.get('/counts', voteController.getVoteCounts);

module.exports = router;
