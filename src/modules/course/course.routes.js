const express = require('express');
const courseController = require('./course.controller');
const courseValidator = require('./course.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with filters
 *     tags: [Courses]
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
 *           default: 20
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by level ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *           enum: [First, Second]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, code, department
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Create a new course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - code
 *               - level
 *               - department
 *               - semester
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: string
 *               department:
 *                 type: string
 *               creditUnits:
 *                 type: number
 *               semester:
 *                 type: string
 *                 enum: [First, Second]
 *               assignedReps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.get(
  '/',
  validate(courseValidator.getAllCoursesValidator),
  courseController.getAllCourses
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(courseValidator.createCourseValidator),
  courseController.createCourse
);

/**
 * @swagger
 * /api/courses/code/{code}:
 *   get:
 *     summary: Get course by code
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 */
router.get(
  '/code/:code',
  validate(courseValidator.getCourseByCodeValidator),
  courseController.getCourseByCode
);

/**
 * @swagger
 * /api/courses/level/{levelId}:
 *   get:
 *     summary: Get courses by level
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get(
  '/level/:levelId',
  validate(courseValidator.getCoursesByLevelValidator),
  courseController.getCoursesByLevel
);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *   put:
 *     summary: Update course (admin only)
 *     tags: [Courses]
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
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: string
 *               department:
 *                 type: string
 *               creditUnits:
 *                 type: number
 *               semester:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 *   delete:
 *     summary: Delete course (admin only)
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 */
router.get(
  '/:id',
  validate(courseValidator.getCourseByIdValidator),
  courseController.getCourseById
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(courseValidator.updateCourseValidator),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(courseValidator.getCourseByIdValidator),
  courseController.deleteCourse
);

/**
 * @swagger
 * /api/courses/{id}/status:
 *   patch:
 *     summary: Toggle course status (admin only)
 *     tags: [Courses]
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(courseValidator.toggleCourseStatusValidator),
  courseController.toggleCourseStatus
);

/**
 * @swagger
 * /api/courses/{id}/assign-reps:
 *   post:
 *     summary: Assign reps to course (admin only)
 *     tags: [Courses]
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
 *               repIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Reps assigned successfully
 */
router.post(
  '/:id/assign-reps',
  authenticate,
  requireAdmin,
  validate(courseValidator.assignRepsValidator),
  courseController.assignReps
);

module.exports = router;

