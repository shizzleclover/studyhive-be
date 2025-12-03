const express = require('express');
const officialNoteController = require('./officialNote.controller');
const officialNoteValidator = require('./officialNote.validator');
const validate = require('../../shared/middlewares/validate.middleware');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/official-notes:
 *   get:
 *     summary: Get all official notes
 *     tags: [Official Notes]
 *     responses:
 *       200:
 *         description: Official notes retrieved
 *   post:
 *     summary: Upload official note (rep/admin)
 *     tags: [Official Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Note uploaded
 */
router.get('/', validate(officialNoteValidator.getAllOfficialNotesValidator), officialNoteController.getAllOfficialNotes);
router.post('/', authenticate, requireRep, validate(officialNoteValidator.createOfficialNoteValidator), officialNoteController.createOfficialNote);

router.get('/course/:courseId', validate(officialNoteValidator.getOfficialNotesByCourseValidator), officialNoteController.getOfficialNotesByCourse);
router.get('/:id', validate(officialNoteValidator.getOfficialNoteByIdValidator), officialNoteController.getOfficialNoteById);
router.get('/:id/download', authenticate, validate(officialNoteValidator.getOfficialNoteByIdValidator), officialNoteController.getDownloadUrl);
router.put('/:id', authenticate, requireRep, validate(officialNoteValidator.updateOfficialNoteValidator), officialNoteController.updateOfficialNote);
router.delete('/:id', authenticate, requireRep, validate(officialNoteValidator.getOfficialNoteByIdValidator), officialNoteController.deleteOfficialNote);

module.exports = router;

