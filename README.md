# StudyHive API 🎓

> A comprehensive academic platform API for students to access past questions, quizzes, notes, and collaborative study resources.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication with refresh tokens
- Email verification system
- Password reset functionality
- Role-based access control (Student, Rep, Admin)
- User profiles with reputation system

### 📚 Academic Resources
- **Courses & Levels** - Hierarchical course organization
- **Past Questions** - Upload and access exam papers
- **Official Notes** - Course materials from reps/admins
- **Community Notes** - Student-created study materials
- **Quizzes** - Interactive practice exams with auto-grading

### 🤝 Community Features
- **Comments** - Discuss notes and resources
- **Voting System** - Upvote/downvote quality content
- **Requests** - Request missing materials
- **Leaderboard** - Reputation-based rankings

### 🔍 Advanced Features
- **Global Search** - Search across all resources
- **Autocomplete** - Real-time search suggestions
- **File Upload** - Cloudflare R2 integration with presigned URLs
- **Rate Limiting** - API abuse prevention
- **Pagination** - Efficient data retrieval

## 🛠️ Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18+
- **Database:** MongoDB v8.0+ with Mongoose ODM
- **Storage:** Cloudflare R2 (S3-compatible)
- **Email:** Nodemailer with SMTP
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest + Supertest
- **Security:** Helmet, bcryptjs, express-rate-limit

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB instance
- Cloudflare R2 bucket (for file storage)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyhive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Add search indexes (optional but recommended)**
   ```bash
   npm run optimize:indexes
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the API**
   - API Base URL: `http://localhost:5000/api`
   - Swagger Documentation: `http://localhost:5000/api-docs`

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studyhive

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=studyhive
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=StudyHive <noreply@studyhive.com>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 📖 API Documentation

### Interactive Documentation

Visit `http://localhost:5000/api-docs` for interactive Swagger documentation where you can:
- Explore all API endpoints
- Test endpoints directly
- View request/response schemas
- Authenticate and test protected routes

### API Endpoints Overview

#### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

#### Users (`/api/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `GET /:id` - Get user by ID
- `PUT /:id/role` - Update user role (Admin only)
- `GET /saved-notes` - Get user's saved notes

#### Courses & Levels
- `GET /api/levels` - List all levels
- `POST /api/levels` - Create level (Admin)
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (Admin)
- `GET /api/courses/:id` - Get course details

#### Past Questions & Official Notes
- `POST /api/upload/presigned-url` - Get upload URL
- `POST /api/past-questions` - Create past question record
- `GET /api/past-questions` - List past questions
- `GET /api/past-questions/:id/download` - Get download URL

#### Community Features
- `POST /api/community-notes` - Create note
- `GET /api/community-notes` - List notes
- `POST /api/votes` - Vote on content
- `POST /api/comments/note/:noteId` - Add comment
- `GET /api/comments/note/:noteId` - Get comments

#### Quizzes
- `POST /api/quizzes` - Create quiz (Rep/Admin)
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt
- `GET /api/quizzes/attempts/me` - Get user's attempts

#### Requests & Leaderboard
- `POST /api/requests` - Create material request
- `GET /api/requests` - List requests
- `POST /api/requests/:id/vote` - Vote on request
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/me` - User's rank

#### Search
- `GET /api/search?q=query` - Global search
- `GET /api/search/courses?q=query` - Search courses
- `GET /api/search/suggestions?q=query` - Autocomplete

## 📁 Project Structure

```
studyhive/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   ├── r2.js           # Cloudflare R2 setup
│   │   ├── email.js        # Email service
│   │   ├── swagger.js      # API documentation
│   │   └── env.js          # Environment validation
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── user/           # User management
│   │   ├── level/          # Academic levels
│   │   ├── course/         # Courses
│   │   ├── past-question/  # Past questions
│   │   ├── official-note/  # Official notes
│   │   ├── community-note/ # Community notes
│   │   ├── comment/        # Comments
│   │   ├── vote/           # Voting system
│   │   ├── quiz/           # Quiz system
│   │   ├── request/        # Material requests
│   │   ├── leaderboard/    # Rankings
│   │   ├── search/         # Search functionality
│   │   └── upload/         # File uploads
│   ├── shared/             # Shared utilities
│   │   ├── middlewares/    # Express middlewares
│   │   └── utils/          # Helper functions
│   ├── scripts/            # Utility scripts
│   └── app.js              # Express app setup
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── setup.js           # Test configuration
├── server.js              # Application entry point
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### View Test Coverage
```bash
npm test
# Coverage report will be generated in ./coverage/
```

## 📦 Deployment

### Production Build

1. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

2. **Install production dependencies**
   ```bash
   npm ci --production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Render / Railway / Heroku
1. Connect your repository
2. Set environment variables
3. Deploy with Node.js buildpack

#### VPS (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repository-url>
cd studyhive
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name studyhive
pm2 startup
pm2 save
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Run `npm run lint` before committing
- Run `npm run format` to format code
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the StudyHive Team

## 🙏 Acknowledgments

- MongoDB for the excellent database
- Cloudflare for R2 storage
- All contributors and users of StudyHive

---

**Happy Studying! 📚✨**
