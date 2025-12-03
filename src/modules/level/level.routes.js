const express = require('express');
const levelController = require('./level.controller');
const levelValidator = require('./level.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireAdmin } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Levels]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Levels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     levels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Level'
 *                     total:
 *                       type: number
 *   post:
 *     summary: Create a new level (admin only)
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *                 example: 100 Level
 *               code:
 *                 type: string
 *                 example: 100L
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Level created successfully
 */
router.get(
  '/',
  validate(levelValidator.getAllLevelsValidator),
  levelController.getAllLevels
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(levelValidator.createLevelValidator),
  levelController.createLevel
);

/**
 * @swagger
 * /api/levels/code/{code}:
 *   get:
 *     summary: Get level by code
 *     tags: [Levels]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Level code (e.g., 100L)
 *     responses:
 *       200:
 *         description: Level retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     level:
 *                       $ref: '#/components/schemas/Level'
 */
router.get(
  '/code/:code',
  validate(levelValidator.getLevelByCodeValidator),
  levelController.getLevelByCode
);

/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: Get level by ID
 *     tags: [Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Level ID
 *     responses:
 *       200:
 *         description: Level retrieved successfully
 *   put:
 *     summary: Update level (admin only)
 *     tags: [Levels]
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
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Level updated successfully
 *   delete:
 *     summary: Delete level (admin only)
 *     tags: [Levels]
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
 *         description: Level deleted successfully
 */
router.get(
  '/:id',
  validate(levelValidator.getLevelByIdValidator),
  levelController.getLevelById
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(levelValidator.updateLevelValidator),
  levelController.updateLevel
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(levelValidator.getLevelByIdValidator),
  levelController.deleteLevel
);

/**
 * @swagger
 * /api/levels/{id}/status:
 *   patch:
 *     summary: Toggle level status (admin only)
 *     tags: [Levels]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Level status updated successfully
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(levelValidator.toggleLevelStatusValidator),
  levelController.toggleLevelStatus
);

module.exports = router;

