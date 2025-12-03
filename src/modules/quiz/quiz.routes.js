const express = require('express');
const quizController = require('./quiz.controller');
const quizValidator = require('./quiz.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes with filtering and pagination
 *     tags: [Quizzes]
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
 *         description: Filter by course ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *       - in: query
 *         name: published
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
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
 *                     $ref: '#/components/schemas/Quiz'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create a new quiz (Rep/Admin only)
 *     tags: [Quizzes]
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
 *               - title
 *               - questions
 *             properties:
 *               course:
 *                 type: string
 *                 example: '507f1f77bcf86cd799439011'
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: 'Data Structures Quiz 1'
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               questions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionText
 *                     - options
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       example: 'What is a stack?'
 *                     options:
 *                       type: array
 *                       minItems: 2
 *                       maxItems: 6
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             example: 'A LIFO data structure'
 *                           isCorrect:
 *                             type: boolean
 *                             example: true
 *                     explanation:
 *                       type: string
 *                       example: 'A stack follows Last In First Out principle'
 *                     points:
 *                       type: integer
 *                       default: 1
 *               timeLimit:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 example: 30
 *                 description: Time limit in minutes
 *               passingScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 50
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *                 default: Medium
 *               shuffleQuestions:
 *                 type: boolean
 *                 default: false
 *               shuffleOptions:
 *                 type: boolean
 *                 default: false
 *               allowReview:
 *                 type: boolean
 *                 default: true
 *               maxAttempts:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 example: 3
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', validate(quizValidator.getAllQuizzesValidator), quizController.getAllQuizzes);
router.post('/', authenticate, requireRep, validate(quizValidator.createQuizValidator), quizController.createQuiz);

/**
 * @swagger
 * /api/quizzes/course/{courseId}:
 *   get:
 *     summary: Get all quizzes for a specific course
 *     tags: [Quizzes]
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
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *     responses:
 *       200:
 *         description: Course quizzes retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/course/:courseId', validate(quizValidator.getQuizzesByCourseValidator), quizController.getQuizzesByCourse);

/**
 * @swagger
 * /api/quizzes/attempts/me:
 *   get:
 *     summary: Get all quiz attempts for the authenticated user
 *     tags: [Quizzes]
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
 *         description: User attempts retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/attempts/me', authenticate, validate(quizValidator.getAllUserAttemptsValidator), quizController.getAllUserAttempts);

/**
 * @swagger
 * /api/quizzes/attempts/{attemptId}:
 *   get:
 *     summary: Get detailed attempt information with answers (for review)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Review not allowed or not authorized
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/attempts/:attemptId', authenticate, validate(quizValidator.getAttemptDetailsValidator), quizController.getAttemptDetails);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get a specific quiz by ID
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: attempting
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, hides correct answers (for when user is attempting quiz)
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update a quiz (author only)
 *     tags: [Quizzes]
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
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *               timeLimit:
 *                 type: integer
 *               passingScore:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               isActive:
 *                 type: boolean
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to update this quiz
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete a quiz (author only)
 *     tags: [Quizzes]
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
 *         description: Quiz deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to delete this quiz
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', validate(quizValidator.getQuizByIdValidator), quizController.getQuizById);
router.put('/:id', authenticate, requireRep, validate(quizValidator.updateQuizValidator), quizController.updateQuiz);
router.delete('/:id', authenticate, requireRep, validate(quizValidator.getQuizByIdValidator), quizController.deleteQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/attempt:
 *   post:
 *     summary: Submit a quiz attempt (authenticated)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *               - timeSpent
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - selectedOptionIndex
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: '507f1f77bcf86cd799439011'
 *                     selectedOptionIndex:
 *                       type: integer
 *                       minimum: 0
 *                       example: 1
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 example: 300
 *                 description: Time spent in seconds
 *     responses:
 *       201:
 *         description: Quiz attempt submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QuizAttempt'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/attempt', authenticate, validate(quizValidator.submitQuizAttemptValidator), quizController.submitQuizAttempt);

/**
 * @swagger
 * /api/quizzes/{id}/attempts:
 *   get:
 *     summary: Get user's attempts for a specific quiz (authenticated)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/attempts', authenticate, validate(quizValidator.getUserQuizAttemptsValidator), quizController.getUserQuizAttempts);

/**
 * @swagger
 * /api/quizzes/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish a quiz (author only)
 *     tags: [Quizzes]
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
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Quiz publish status updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to publish/unpublish this quiz
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/publish', authenticate, requireRep, validate(quizValidator.togglePublishValidator), quizController.togglePublishStatus);

module.exports = router;
