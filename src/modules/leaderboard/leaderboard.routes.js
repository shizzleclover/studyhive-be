const express = require('express');
const leaderboardController = require('./leaderboard.controller');
const { authenticate } = require('../../shared/middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get global leaderboard ranked by reputation score
 *     tags: [Leaderboard]
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
 *           default: 50
 *           maximum: 100
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, rep, admin]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       reputationScore:
 *                         type: integer
 *                       notesCreated:
 *                         type: integer
 *                       quizzesTaken:
 *                         type: integer
 *                       rank:
 *                         type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', leaderboardController.getGlobalLeaderboard);

/**
 * @swagger
 * /api/leaderboard/top-contributors:
 *   get:
 *     summary: Get top contributors (users with most notes created)
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Top contributors retrieved successfully
 */
router.get('/top-contributors', leaderboardController.getTopContributors);

/**
 * @swagger
 * /api/leaderboard/quiz-champions:
 *   get:
 *     summary: Get quiz champions (users with highest quiz performance)
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Quiz champions retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       quizzesTaken:
 *                         type: integer
 *                       quizCorrectAnswers:
 *                         type: integer
 *                       accuracy:
 *                         type: integer
 *                       rank:
 *                         type: integer
 */
router.get('/quiz-champions', leaderboardController.getQuizChampions);

/**
 * @swagger
 * /api/leaderboard/stats:
 *   get:
 *     summary: Get overall leaderboard statistics
 *     tags: [Leaderboard]
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
 *                     totalUsers:
 *                       type: integer
 *                     totalReputation:
 *                       type: integer
 *                     averageReputation:
 *                       type: integer
 *                     totalNotes:
 *                       type: integer
 *                     totalQuizzesTaken:
 *                       type: integer
 *                     topUser:
 *                       type: object
 */
router.get('/stats', leaderboardController.getLeaderboardStats);

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Get authenticated user's leaderboard position and rank
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User position retrieved successfully
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
 *                     user:
 *                       type: object
 *                     globalRank:
 *                       type: integer
 *                       example: 42
 *                     roleRank:
 *                       type: integer
 *                       example: 15
 *                     totalUsers:
 *                       type: integer
 *                     totalRoleUsers:
 *                       type: integer
 *                     percentile:
 *                       type: integer
 *                       example: 85
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, leaderboardController.getUserPosition);

/**
 * @swagger
 * /api/leaderboard/nearby:
 *   get:
 *     summary: Get users nearby on the leaderboard (authenticated)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: integer
 *           default: 5
 *           maximum: 20
 *         description: Number of users above and below to retrieve
 *     responses:
 *       200:
 *         description: Nearby users retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/nearby', authenticate, leaderboardController.getUsersNearby);

module.exports = router;
