// User Roles
const USER_ROLES = {
  STUDENT: 'student',
  REP: 'rep',
  ADMIN: 'admin',
};

// Vote Types
const VOTE_TYPES = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote',
};

// Entity Types (for voting)
const ENTITY_TYPES = {
  NOTE: 'note',
  COMMENT: 'comment',
};

// Request Status
const REQUEST_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

// Request Types
const REQUEST_TYPES = {
  PAST_QUESTION: 'past-question',
  OFFICIAL_NOTE: 'official-note',
  OTHER: 'other',
};

// Semesters
const SEMESTERS = {
  FIRST: 'First',
  SECOND: 'Second',
};

// Past Question Types
const PAST_QUESTION_TYPES = {
  EXAM: 'past-exam',
  MID_SEMESTER: 'past-mid-semester',
  QUIZ: 'past-quiz',
  ASSIGNMENT: 'past-assignment',
  CLASS_WORK: 'past-class-work',
  GROUP_PROJECT: 'past-group-project',
  PROJECT: 'past-project',
};

// File Types
const FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT: 'application/vnd.ms-powerpoint',
};

// Allowed file extensions
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

// Max file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Reputation weights
const REPUTATION_WEIGHTS = {
  NOTE_UPVOTE: 2,
  NOTE_SAVE: 1,
  COMMENT: 1,
  NOTE_DOWNVOTE: -1,
  QUIZ_CORRECT_ANSWER: 1,
};

// Leaderboard time windows
const LEADERBOARD_WINDOWS = {
  ALL_TIME: 'all-time',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Token expiry
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
};

module.exports = {
  USER_ROLES,
  VOTE_TYPES,
  ENTITY_TYPES,
  REQUEST_STATUS,
  REQUEST_TYPES,
  SEMESTERS,
  PAST_QUESTION_TYPES,
  FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  REPUTATION_WEIGHTS,
  LEADERBOARD_WINDOWS,
  HTTP_STATUS,
  TOKEN_EXPIRY,
};
