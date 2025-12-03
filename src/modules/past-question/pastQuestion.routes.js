const express = require('express');
const pastQuestionController = require('./pastQuestion.controller');
const pastQuestionValidator = require('./pastQuestion.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/past-questions:
 *   get:
 *     summary: Get all past questions with filters
 *     tags: [Past Questions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: course
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [past-exam, past-mid-semester, past-quiz, past-assignment, past-class-work, past-group-project, past-project]
 *         description: Type of past question
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *     responses:
 *       200:
 *         description: Past questions retrieved successfully
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
 *                     pastQuestions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PastQuestion'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Upload a new past question (rep/admin only)
 *     tags: [Past Questions]
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
 *               - year
 *               - semester
 *               - type
 *               - title
 *               - fileKey
 *               - fileUrl
 *               - fileName
 *               - fileSize
 *               - fileType
 *             properties:
 *               course:
 *                 type: string
 *                 description: Course ID
 *               year:
 *                 type: number
 *                 minimum: 2000
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *               type:
 *                 type: string
 *                 enum: [past-exam, past-mid-semester, past-quiz, past-assignment, past-class-work, past-group-project, past-project]
 *                 description: Type of past question
 *                 example: past-exam
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileKey:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               fileType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Past question uploaded successfully
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
 *                   type: object
 *                   properties:
 *                     pastQuestion:
 *                       $ref: '#/components/schemas/PastQuestion'
 */
router.get(
  '/',
  validate(pastQuestionValidator.getAllPastQuestionsValidator),
  pastQuestionController.getAllPastQuestions
);

router.post(
  '/',
  authenticate,
  requireRep,
  validate(pastQuestionValidator.createPastQuestionValidator),
  pastQuestionController.createPastQuestion
);

router.get(
  '/course/:courseId',
  validate(pastQuestionValidator.getPastQuestionsByCourseValidator),
  pastQuestionController.getPastQuestionsByCourse
);

router.get(
  '/:id',
  validate(pastQuestionValidator.getPastQuestionByIdValidator),
  pastQuestionController.getPastQuestionById
);

router.get(
  '/:id/download',
  authenticate,
  validate(pastQuestionValidator.getPastQuestionByIdValidator),
  pastQuestionController.getDownloadUrl
);

router.put(
  '/:id',
  authenticate,
  requireRep,
  validate(pastQuestionValidator.updatePastQuestionValidator),
  pastQuestionController.updatePastQuestion
);

router.delete(
  '/:id',
  authenticate,
  requireRep,
  validate(pastQuestionValidator.getPastQuestionByIdValidator),
  pastQuestionController.deletePastQuestion
);

router.patch(
  '/:id/verify',
  authenticate,
  requireRep,
  validate(pastQuestionValidator.toggleVerificationValidator),
  pastQuestionController.toggleVerification
);

module.exports = router;

