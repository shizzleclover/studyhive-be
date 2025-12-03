const { REPUTATION_WEIGHTS } = require('./constants');

/**
 * Calculate community note score
 * Formula: (upvotes * 2) + saves + comments - downvotes
 * @param {Object} note - Note object with upvotes, downvotes, saves, commentCount
 * @returns {number} Calculated score
 */
const calculateNoteScore = (note) => {
  const { upvotes = 0, downvotes = 0, saves = 0, commentCount = 0 } = note;
  
  return (
    upvotes * REPUTATION_WEIGHTS.NOTE_UPVOTE +
    saves * REPUTATION_WEIGHTS.NOTE_SAVE +
    commentCount * REPUTATION_WEIGHTS.COMMENT +
    downvotes * REPUTATION_WEIGHTS.NOTE_DOWNVOTE
  );
};

/**
 * Calculate user reputation score
 * @param {Object} userData - User data with stats
 * @returns {number} Reputation score
 */
const calculateUserReputation = (userData) => {
  const {
    noteUpvotesReceived = 0,
    noteSavesReceived = 0,
    commentsCount = 0,
    noteDownvotesReceived = 0,
    quizCorrectAnswers = 0,
  } = userData;

  return (
    noteUpvotesReceived * REPUTATION_WEIGHTS.NOTE_UPVOTE +
    noteSavesReceived * REPUTATION_WEIGHTS.NOTE_SAVE +
    commentsCount * REPUTATION_WEIGHTS.COMMENT +
    noteDownvotesReceived * REPUTATION_WEIGHTS.NOTE_DOWNVOTE +
    quizCorrectAnswers * REPUTATION_WEIGHTS.QUIZ_CORRECT_ANSWER
  );
};

/**
 * Calculate quiz score
 * @param {Array} answers - User's answers [{questionId, selectedOption}]
 * @param {Array} questions - Quiz questions with correct answers
 * @returns {Object} Score data {score, totalQuestions, correctAnswers}
 */
const calculateQuizScore = (answers, questions) => {
  let correctAnswers = 0;
  const totalQuestions = questions.length;

  answers.forEach((answer) => {
    const question = questions.find(
      (q) => q._id.toString() === answer.questionId.toString()
    );

    if (question && question.correctOptionIndex === answer.selectedOption) {
      correctAnswers++;
    }
  });

  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return {
    score,
    totalQuestions,
    correctAnswers,
    percentage: score,
  };
};

/**
 * Get trending score based on time decay
 * More recent content gets higher score
 * @param {number} score - Base score
 * @param {Date} createdAt - Creation date
 * @returns {number} Trending score
 */
const calculateTrendingScore = (score, createdAt) => {
  const now = new Date();
  const ageInHours = (now - new Date(createdAt)) / (1000 * 60 * 60);
  
  // Decay factor: content older than 168 hours (1 week) gets penalized
  const decayFactor = Math.max(0, 1 - ageInHours / 168);
  
  return score * (1 + decayFactor);
};

module.exports = {
  calculateNoteScore,
  calculateUserReputation,
  calculateQuizScore,
  calculateTrendingScore,
};
