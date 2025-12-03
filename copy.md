# Study Hive Backend - Modular Structure

```
studyhive-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── index.js              # Central config export
│   │   ├── db.js                 # MongoDB connection
│   │   ├── r2.js                 # Cloudflare R2 client setup
│   │   └── env.js                # Environment variables validation
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.model.js         # User schema (auth-related fields)
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validator.js
│   │   │   └── index.js              # Export router
│   │   │
│   │   ├── user/
│   │   │   ├── user.model.js         # User schema (profile, reputation)
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── level/
│   │   │   ├── level.model.js
│   │   │   ├── level.routes.js
│   │   │   ├── level.controller.js
│   │   │   ├── level.service.js
│   │   │   ├── level.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── course/
│   │   │   ├── course.model.js
│   │   │   ├── course.routes.js
│   │   │   ├── course.controller.js
│   │   │   ├── course.service.js
│   │   │   ├── course.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── past-question/
│   │   │   ├── pastQuestion.model.js
│   │   │   ├── pastQuestion.routes.js
│   │   │   ├── pastQuestion.controller.js
│   │   │   ├── pastQuestion.service.js
│   │   │   ├── pastQuestion.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── official-note/
│   │   │   ├── officialNote.model.js
│   │   │   ├── officialNote.routes.js
│   │   │   ├── officialNote.controller.js
│   │   │   ├── officialNote.service.js
│   │   │   ├── officialNote.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── community-note/
│   │   │   ├── communityNote.model.js
│   │   │   ├── communityNote.routes.js
│   │   │   ├── communityNote.controller.js
│   │   │   ├── communityNote.service.js
│   │   │   ├── communityNote.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── comment/
│   │   │   ├── comment.model.js
│   │   │   ├── comment.routes.js
│   │   │   ├── comment.controller.js
│   │   │   ├── comment.service.js
│   │   │   ├── comment.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── vote/
│   │   │   ├── vote.model.js
│   │   │   ├── vote.routes.js
│   │   │   ├── vote.controller.js
│   │   │   ├── vote.service.js
│   │   │   └── index.js
│   │   │
│   │   ├── quiz/
│   │   │   ├── quiz.model.js
│   │   │   ├── quizAttempt.model.js
│   │   │   ├── quiz.routes.js
│   │   │   ├── quiz.controller.js
│   │   │   ├── quiz.service.js
│   │   │   ├── quiz.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── request/
│   │   │   ├── request.model.js
│   │   │   ├── request.routes.js
│   │   │   ├── request.controller.js
│   │   │   ├── request.service.js
│   │   │   ├── request.validator.js
│   │   │   └── index.js
│   │   │
│   │   ├── upload/
│   │   │   ├── upload.routes.js
│   │   │   ├── upload.controller.js
│   │   │   ├── upload.service.js
│   │   │   └── index.js
│   │   │
│   │   ├── leaderboard/
│   │   │   ├── leaderboard.routes.js
│   │   │   ├── leaderboard.controller.js
│   │   │   ├── leaderboard.service.js
│   │   │   └── index.js
│   │   │
│   │   └── index.js              # Aggregates all module routers
│   │
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   │
│   │   └── utils/
│   │       ├── ApiError.js
│   │       ├── ApiResponse.js
│   │       ├── asyncHandler.js
│   │       ├── constants.js
│   │       ├── helpers.js
│   │       └── scoreCalculator.js
│   │
│   └── app.js                    # Express app setup
│
├── tests/
│   ├── modules/
│   │   ├── auth/
│   │   ├── course/
│   │   └── ...
│   └── setup.js
│
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── server.js                     # Entry point
└── README.md
```

---

## Module Structure Pattern

Each module is self-contained:

```
module-name/
├── moduleName.model.js       # Mongoose schema
├── moduleName.routes.js      # Express routes
├── moduleName.controller.js  # Request handlers
├── moduleName.service.js     # Business logic
├── moduleName.validator.js   # Joi schemas
└── index.js                  # Exports router
```

**Example `index.js` for a module:**
```js
const router = require('./course.routes');
module.exports = router;
```

---

## Module Aggregator (src/modules/index.js)

```js
const express = require('express');
const router = express.Router();

// Import modules as needed
const authRoutes = require('./auth');
const userRoutes = require('./user');
const levelRoutes = require('./level');
const courseRoutes = require('./course');
// ... add more as you build them

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/levels', levelRoutes);
router.use('/courses', courseRoutes);
// ... add more as you build them

module.exports = router;
```

---

## Dependency Graph (Build Order)

```
Phase 1: Foundation
├── shared/utils        (ApiError, ApiResponse, asyncHandler)
├── shared/middlewares  (error handler, validate)
├── config              (db, env)
└── app.js + server.js

Phase 2: Auth & Users
├── auth module         (signup, login, JWT)
└── user module         (profile, role management)

Phase 3: Core Hierarchy
├── level module        (100L, 200L, etc.)
└── course module       (courses under levels)

Phase 4: Resources
├── upload module       (R2 signed URLs)
├── past-question module
└── official-note module

Phase 5: Community
├── community-note module
├── vote module
└── comment module

Phase 6: Engagement
├── quiz module
├── request module
└── leaderboard module
```

---

## How to Add a New Module

1. Create folder: `src/modules/new-module/`
2. Create files:
   - `newModule.model.js`
   - `newModule.routes.js`
   - `newModule.controller.js`
   - `newModule.service.js`
   - `newModule.validator.js`
   - `index.js`
3. Register in `src/modules/index.js`
4. Done!

---

## Resource Hierarchy

```
Levels
  └── 100 Level, 200 Level, 300 Level, 400 Level, 500 Level

Courses (belong to a Level)
  └── CSC101, MTH101, PHY101...

Resources (belong to a Course)
  ├── Past Questions
  ├── Official Notes
  ├── Community Notes
  └── Quizzes
```

**API Structure:**
```
GET  /api/levels
GET  /api/levels/:levelId
GET  /api/levels/:levelId/courses

GET  /api/courses/:courseId
GET  /api/courses/:courseId/past-questions
GET  /api/courses/:courseId/official-notes
GET  /api/courses/:courseId/community-notes
GET  /api/courses/:courseId/quizzes
```

---

## Environment Variables (.env.example)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=studyhive
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## NPM Install (All at Once)

```bash
# Create project
mkdir studyhive-backend && cd studyhive-backend
npm init -y

# All dependencies
npm i express mongoose dotenv cors helmet morgan jsonwebtoken bcryptjs joi express-rate-limit @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Dev dependencies
npm i -D nodemon eslint prettier
```

---

## Next: Phase 1 - Foundation

Ready to code:
1. `shared/utils/` — ApiError, ApiResponse, asyncHandler
2. `shared/middlewares/` — error handler, validate
3. `config/` — db.js, env.js
4. `app.js` + `server.js`

Start?