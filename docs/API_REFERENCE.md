# StudyHive API Reference

Complete API reference for the StudyHive platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.studyhive.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

### How to Authenticate

1. **Login or Signup** to get access and refresh tokens
2. **Include the access token** in the Authorization header:
   ```
   Authorization: Bearer <your-access-token>
   ```
3. **Refresh the token** when it expires using the refresh token

### Authentication Flow

```javascript
// 1. Signup
POST /api/auth/signup
Body: { name, email, password }
Response: { user, accessToken, refreshToken }

// 2. Verify Email
POST /api/auth/verify-email
Body: { token }

// 3. Login (after verification)
POST /api/auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

// 4. Refresh Token (when access token expires)
POST /api/auth/refresh
Body: { refreshToken }
Response: { accessToken }

// 5. Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
```

## User Roles

The API supports three user roles with different permissions:

### Student (Default)
- Access all public content
- Create community notes
- Take quizzes
- Comment and vote on content
- Request materials

### Rep (Representative)
- All Student permissions
- Upload official notes
- Create and manage quizzes
- Fulfill or reject requests
- Pin important notes

### Admin
- All Rep permissions
- Manage users and roles
- Create courses and levels
- System-wide management

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

## Pagination

Most list endpoints support pagination using query parameters:

```
GET /api/courses?page=1&limit=10
```

Parameters:
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page

## Filtering

Many endpoints support filtering:

```
GET /api/courses?levelId=xxx&semester=First
GET /api/past-questions?year=2023&semester=First
GET /api/requests?status=pending&requestType=past-question
```

## Search

### Global Search
Search across all resources:
```
GET /api/search?q=data structures&page=1&limit=20
```

### Resource-Specific Search
```
GET /api/search/courses?q=CSC&levelId=xxx
GET /api/search/community-notes?q=arrays&courseId=xxx
GET /api/search/past-questions?q=exam&year=2023
GET /api/search/users?q=john&role=student
```

### Autocomplete
Get search suggestions:
```
GET /api/search/suggestions?q=dat&type=all
```

## File Upload

File uploads use a two-step process with presigned URLs:

### Step 1: Get Presigned URL
```javascript
POST /api/upload/presigned-url
Headers: { Authorization: "Bearer <token>" }
Body: {
  fileName: "exam-2023.pdf",
  fileType: "application/pdf",
  fileSize: 1024000
}
Response: {
  uploadUrl: "https://r2.cloudflare.com/...",
  downloadUrl: "https://pub-xxx.r2.dev/...",
  fileKey: "unique-file-key",
  expiresIn: 3600
}
```

### Step 2: Upload to R2
```javascript
PUT <uploadUrl>
Headers: { Content-Type: "application/pdf" }
Body: <file-binary-data>
```

### Step 3: Create Resource Record
```javascript
POST /api/past-questions
Headers: { Authorization: "Bearer <token>" }
Body: {
  courseId: "xxx",
  year: 2023,
  semester: "First",
  title: "CSC 101 Exam 2023",
  fileKey: "unique-file-key",
  fileUrl: "https://pub-xxx.r2.dev/...",
  fileName: "exam-2023.pdf",
  fileSize: 1024000,
  fileType: "application/pdf"
}
```

## Rate Limits

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit |
|--------------|-------|
| General | 100 requests / 15 minutes |
| Authentication | 5 requests / 15 minutes |
| File Upload | 20 requests / hour |
| Quiz Attempts | 10 requests / hour |
| Search | 50 requests / 15 minutes |

When you exceed the rate limit, you'll receive a 429 status code.

## Quiz System

### Creating a Quiz (Rep/Admin)
```javascript
POST /api/quizzes
Headers: { Authorization: "Bearer <token>" }
Body: {
  course: "courseId",
  title: "Data Structures Quiz 1",
  description: "Test your knowledge",
  questions: [
    {
      questionText: "What is a stack?",
      options: [
        { text: "LIFO data structure", isCorrect: true },
        { text: "FIFO data structure", isCorrect: false },
        { text: "Random access", isCorrect: false },
        { text: "Tree structure", isCorrect: false }
      ],
      explanation: "Stack follows Last In First Out principle",
      points: 1
    }
  ],
  timeLimit: 30,
  passingScore: 50,
  difficulty: "Medium",
  maxAttempts: 3,
  isPublished: true
}
```

### Taking a Quiz
```javascript
// 1. Get quiz with questions
GET /api/quizzes/:id?attempting=true

// 2. Submit answers
POST /api/quizzes/:id/attempt
Body: {
  answers: [
    { questionId: "xxx", selectedOptionIndex: 0 }
  ],
  timeSpent: 300
}

Response: {
  score: 85,
  isPassed: true,
  correctAnswers: 17,
  totalQuestions: 20,
  pointsEarned: 17,
  totalPoints: 20
}
```

## Request System

### Creating a Request
```javascript
POST /api/requests
Headers: { Authorization: "Bearer <token>" }
Body: {
  course: "courseId",
  requestType: "past-question",
  title: "Need 2022 Exam Paper",
  description: "Looking for first semester exam",
  specificDetails: {
    year: 2022,
    semester: "First",
    topic: "Data Structures"
  }
}
```

### Voting on Requests
```javascript
POST /api/requests/:id/vote
Headers: { Authorization: "Bearer <token>" }
Body: {
  voteType: "upvote"
}
```

### Fulfilling a Request (Rep/Admin)
```javascript
PATCH /api/requests/:id/fulfill
Headers: { Authorization: "Bearer <token>" }
Body: {
  note: "Uploaded the requested material",
  resourceId: "pastQuestionId",
  resourceType: "PastQuestion"
}
```

## Leaderboard

### Global Leaderboard
```javascript
GET /api/leaderboard?page=1&limit=50&role=student
```

### Top Contributors
```javascript
GET /api/leaderboard/top-contributors?limit=10
```

### Quiz Champions
```javascript
GET /api/leaderboard/quiz-champions?limit=10
```

### Your Position
```javascript
GET /api/leaderboard/me
Headers: { Authorization: "Bearer <token>" }

Response: {
  user: { ... },
  globalRank: 42,
  roleRank: 15,
  totalUsers: 500,
  percentile: 85
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Duplicate entry |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Best Practices

1. **Always handle token expiration** - Implement refresh token logic
2. **Use pagination** - Don't fetch all data at once
3. **Implement proper error handling** - Check status codes
4. **Cache static data** - Courses, levels rarely change
5. **Respect rate limits** - Implement exponential backoff
6. **Validate input** - Use the same Joi schemas
7. **Use search wisely** - Minimum 2 characters for search

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class StudyHiveClient {
  constructor(baseURL, accessToken) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  async getCourses(page = 1) {
    const response = await this.client.get('/courses', {
      params: { page }
    });
    return response.data;
  }

  async search(query) {
    const response = await this.client.get('/search', {
      params: { q: query }
    });
    return response.data;
  }
}
```

### Python
```python
import requests

class StudyHiveClient:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {access_token}'}
    
    def get_courses(self, page=1):
        response = requests.get(
            f'{self.base_url}/courses',
            headers=self.headers,
            params={'page': page}
        )
        return response.json()
    
    def search(self, query):
        response = requests.get(
            f'{self.base_url}/search',
            headers=self.headers,
            params={'q': query}
        )
        return response.json()
```

## Support

For questions or issues:
- Email: support@studyhive.com
- GitHub Issues: [github.com/studyhive/api/issues]
- Documentation: [docs.studyhive.com]

---

Last Updated: December 2024

