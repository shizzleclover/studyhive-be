const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('./auth');
const userRoutes = require('./user');
const levelRoutes = require('./level');
const courseRoutes = require('./course');
const uploadRoutes = require('./upload');
const pastQuestionRoutes = require('./past-question');
const officialNoteRoutes = require('./official-note');
const communityNoteRoutes = require('./community-note');
const voteRoutes = require('./vote');
const commentRoutes = require('./comment');
const quizRoutes = require('./quiz');
const requestRoutes = require('./request');
const leaderboardRoutes = require('./leaderboard');
const searchRoutes = require('./search');

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/levels', levelRoutes);
router.use('/courses', courseRoutes);
router.use('/upload', uploadRoutes);
router.use('/past-questions', pastQuestionRoutes);
router.use('/official-notes', officialNoteRoutes);
router.use('/community-notes', communityNoteRoutes);
router.use('/votes', voteRoutes);
router.use('/comments', commentRoutes);
router.use('/quizzes', quizRoutes);
router.use('/requests', requestRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/search', searchRoutes);

// Health check for API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyHive API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      levels: '/api/levels',
      courses: '/api/courses',
      upload: '/api/upload',
      pastQuestions: '/api/past-questions',
      officialNotes: '/api/official-notes',
      communityNotes: '/api/community-notes',
      votes: '/api/votes',
      comments: '/api/comments',
      quizzes: '/api/quizzes',
      requests: '/api/requests',
      leaderboard: '/api/leaderboard',
      search: '/api/search',
    },
  });
});

module.exports = router;
