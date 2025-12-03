const express = require('express');
const searchController = require('./search.controller');
const { rateLimiters } = require('../../shared/middlewares/rateLimit.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search across all resources (courses, notes, past questions, quizzes)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *         example: 'data structures'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Search completed successfully
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
 *                     oneOf:
 *                       - $ref: '#/components/schemas/Course'
 *                       - $ref: '#/components/schemas/CommunityNote'
 *                       - $ref: '#/components/schemas/Quiz'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     counts:
 *                       type: object
 *                       properties:
 *                         courses:
 *                           type: integer
 *                         communityNotes:
 *                           type: integer
 *                         pastQuestions:
 *                           type: integer
 *                         officialNotes:
 *                           type: integer
 *                         quizzes:
 *                           type: integer
 *                         total:
 *                           type: integer
 */
router.get('/', rateLimiters.search, searchController.globalSearch);

/**
 * @swagger
 * /api/search/courses:
 *   get:
 *     summary: Search courses by title, code, description, or department
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         example: 'CSC'
 *       - in: query
 *         name: levelId
 *         schema:
 *           type: string
 *         description: Filter by level
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
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
 *         description: Courses search completed
 */
router.get('/courses', rateLimiters.search, searchController.searchCourses);

/**
 * @swagger
 * /api/search/community-notes:
 *   get:
 *     summary: Search community notes by title or content
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course
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
 *         description: Notes search completed
 */
router.get('/community-notes', rateLimiters.search, searchController.searchCommunityNotes);

/**
 * @swagger
 * /api/search/past-questions:
 *   get:
 *     summary: Search past questions by title or description
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
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
 *         description: Past questions search completed
 */
router.get('/past-questions', rateLimiters.search, searchController.searchPastQuestions);

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search users by name or email
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, rep, admin]
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
 *         description: Users search completed
 */
router.get('/users', rateLimiters.search, searchController.searchUsers);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions for autocomplete
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, courses, notes]
 *           default: all
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
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
 *                       text:
 *                         type: string
 *                       type:
 *                         type: string
 *                       id:
 *                         type: string
 */
router.get('/suggestions', rateLimiters.search, searchController.getSearchSuggestions);

/**
 * @swagger
 * /api/search/trending:
 *   get:
 *     summary: Get trending search terms and popular content
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Trending searches retrieved successfully
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
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: string
 *                     notes:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/trending', searchController.getTrendingSearches);

module.exports = router;

