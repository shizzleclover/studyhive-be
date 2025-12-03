const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'StudyHive API',
    version: '1.0.0',
    description: 'A student-focused academic platform API for past questions, quizzes, notes, and collaborative study community',
    contact: {
      name: 'StudyHive Team',
      email: config.mailersend.fromEmail,
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
    {
      url: 'https://api.studyhive.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Please authenticate',
                },
              },
            },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Insufficient permissions',
                },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Resource not found',
                },
              },
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          stack: {
            type: 'string',
            description: 'Stack trace (only in development)',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          role: {
            type: 'string',
            enum: ['student', 'rep', 'admin'],
            example: 'student',
          },
          isVerified: {
            type: 'boolean',
            example: false,
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          bio: {
            type: 'string',
            example: 'Computer Science student',
          },
          reputationScore: {
            type: 'number',
            example: 25,
          },
          notesCreated: {
            type: 'number',
            example: 5,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Level: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            example: '100 Level',
          },
          code: {
            type: 'string',
            example: '100L',
          },
          description: {
            type: 'string',
            example: 'First year undergraduate level',
          },
          order: {
            type: 'number',
            example: 1,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Course: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            example: 'Introduction to Computer Science',
          },
          code: {
            type: 'string',
            example: 'CSC101',
          },
          description: {
            type: 'string',
            example: 'Fundamentals of computer science',
          },
          level: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          department: {
            type: 'string',
            example: 'Computer Science',
          },
          creditUnits: {
            type: 'number',
            example: 3,
          },
          semester: {
            type: 'string',
            enum: ['First', 'Second'],
            example: 'First',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdBy: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      PastQuestion: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          course: {
            $ref: '#/components/schemas/Course',
          },
          year: {
            type: 'number',
            example: 2024,
            minimum: 2000,
          },
          semester: {
            type: 'string',
            enum: ['First', 'Second'],
            example: 'First',
          },
          type: {
            type: 'string',
            enum: [
              'past-exam',
              'past-mid-semester',
              'past-quiz',
              'past-assignment',
              'past-class-work',
              'past-group-project',
              'past-project',
            ],
            example: 'past-exam',
            description: 'Type of past question material',
          },
          title: {
            type: 'string',
            example: 'CS101 Final Exam 2024',
          },
          description: {
            type: 'string',
            example: 'Final examination paper for Introduction to Computer Science',
            maxLength: 500,
          },
          fileKey: {
            type: 'string',
            example: 'past-questions/cs101-final-2024.pdf',
          },
          fileUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://r2.example.com/past-questions/cs101-final-2024.pdf',
          },
          fileName: {
            type: 'string',
            example: 'cs101-final-2024.pdf',
          },
          fileSize: {
            type: 'number',
            example: 1024000,
            description: 'File size in bytes',
          },
          fileType: {
            type: 'string',
            example: 'application/pdf',
          },
          uploadedBy: {
            $ref: '#/components/schemas/User',
          },
          downloadCount: {
            type: 'number',
            example: 45,
            default: 0,
          },
          isVerified: {
            type: 'boolean',
            example: true,
            default: false,
            description: 'Verified by admin/rep for accuracy',
          },
          isActive: {
            type: 'boolean',
            example: true,
            default: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CommunityNote: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          authorId: {
            $ref: '#/components/schemas/User',
          },
          courseId: {
            $ref: '#/components/schemas/Course',
          },
          title: {
            type: 'string',
            example: 'Quick Study Guide for Data Structures',
          },
          content: {
            type: 'string',
            example: 'This is a comprehensive guide covering...',
          },
          upvotes: {
            type: 'number',
            example: 25,
          },
          downvotes: {
            type: 'number',
            example: 2,
          },
          saves: {
            type: 'number',
            example: 15,
          },
          commentCount: {
            type: 'number',
            example: 8,
          },
          isPinned: {
            type: 'boolean',
            example: false,
          },
          score: {
            type: 'number',
            example: 23,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Vote: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          entityType: {
            type: 'string',
            enum: ['note', 'comment'],
            example: 'note',
          },
          entityId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          voteType: {
            type: 'string',
            enum: ['upvote', 'downvote'],
            example: 'upvote',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          noteId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          userId: {
            $ref: '#/components/schemas/User',
          },
          content: {
            type: 'string',
            example: 'This is a great explanation!',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Quiz: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          course: {
            $ref: '#/components/schemas/Course',
          },
          title: {
            type: 'string',
            example: 'Data Structures Quiz 1',
          },
          description: {
            type: 'string',
            example: 'Test your knowledge on basic data structures',
          },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                questionText: {
                  type: 'string',
                  example: 'What is a stack?',
                },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'string',
                        example: 'A LIFO data structure',
                      },
                      isCorrect: {
                        type: 'boolean',
                        example: true,
                      },
                    },
                  },
                },
                explanation: {
                  type: 'string',
                  example: 'A stack follows Last In First Out principle',
                },
                points: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
          timeLimit: {
            type: 'integer',
            nullable: true,
            example: 30,
          },
          passingScore: {
            type: 'integer',
            example: 50,
          },
          difficulty: {
            type: 'string',
            enum: ['Easy', 'Medium', 'Hard'],
            example: 'Medium',
          },
          shuffleQuestions: {
            type: 'boolean',
            example: false,
          },
          shuffleOptions: {
            type: 'boolean',
            example: false,
          },
          allowReview: {
            type: 'boolean',
            example: true,
          },
          maxAttempts: {
            type: 'integer',
            nullable: true,
            example: 3,
          },
          attemptsCount: {
            type: 'integer',
            example: 15,
          },
          averageScore: {
            type: 'number',
            example: 75.5,
          },
          passRate: {
            type: 'number',
            example: 80,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          isPublished: {
            type: 'boolean',
            example: true,
          },
          createdBy: {
            $ref: '#/components/schemas/User',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      QuizAttempt: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          quiz: {
            $ref: '#/components/schemas/Quiz',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011',
                },
                selectedOptionIndex: {
                  type: 'integer',
                  example: 1,
                },
                isCorrect: {
                  type: 'boolean',
                  example: true,
                },
                pointsEarned: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
          score: {
            type: 'number',
            example: 85,
          },
          pointsEarned: {
            type: 'integer',
            example: 17,
          },
          totalPoints: {
            type: 'integer',
            example: 20,
          },
          correctAnswers: {
            type: 'integer',
            example: 17,
          },
          totalQuestions: {
            type: 'integer',
            example: 20,
          },
          isPassed: {
            type: 'boolean',
            example: true,
          },
          timeSpent: {
            type: 'integer',
            example: 1200,
          },
          startedAt: {
            type: 'string',
            format: 'date-time',
          },
          submittedAt: {
            type: 'string',
            format: 'date-time',
          },
          attemptNumber: {
            type: 'integer',
            example: 1,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Request: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          course: {
            $ref: '#/components/schemas/Course',
          },
          requestType: {
            type: 'string',
            enum: ['past-question', 'official-note', 'community-note', 'quiz', 'other'],
            example: 'past-question',
          },
          title: {
            type: 'string',
            example: 'Need 2022 Exam Paper',
          },
          description: {
            type: 'string',
            example: 'Looking for the 2022 first semester exam paper',
          },
          specificDetails: {
            type: 'object',
            properties: {
              year: {
                type: 'integer',
                example: 2022,
              },
              semester: {
                type: 'string',
                enum: ['First', 'Second', 'Both'],
                example: 'First',
              },
              topic: {
                type: 'string',
                example: 'Data Structures',
              },
            },
          },
          status: {
            type: 'string',
            enum: ['pending', 'in-progress', 'fulfilled', 'rejected'],
            example: 'pending',
          },
          upvotes: {
            type: 'integer',
            example: 15,
          },
          downvotes: {
            type: 'integer',
            example: 2,
          },
          priority: {
            type: 'integer',
            example: 13,
          },
          fulfilledBy: {
            $ref: '#/components/schemas/User',
          },
          fulfilledAt: {
            type: 'string',
            format: 'date-time',
          },
          fulfillmentNote: {
            type: 'string',
          },
          rejectedBy: {
            $ref: '#/components/schemas/User',
          },
          rejectedAt: {
            type: 'string',
            format: 'date-time',
          },
          rejectionReason: {
            type: 'string',
          },
          createdBy: {
            $ref: '#/components/schemas/User',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'number',
            example: 1,
          },
          totalPages: {
            type: 'number',
            example: 5,
          },
          totalItems: {
            type: 'number',
            example: 50,
          },
          itemsPerPage: {
            type: 'number',
            example: 10,
          },
          hasNextPage: {
            type: 'boolean',
            example: true,
          },
          hasPrevPage: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Levels',
      description: 'Academic level management',
    },
    {
      name: 'Courses',
      description: 'Course management',
    },
    {
      name: 'Past Questions',
      description: 'Past question paper management',
    },
    {
      name: 'Official Notes',
      description: 'Official study material management',
    },
    {
      name: 'Community Notes',
      description: 'Student-created notes',
    },
    {
      name: 'Comments',
      description: 'Note comments and discussions',
    },
    {
      name: 'Votes',
      description: 'Voting system for notes',
    },
    {
      name: 'Quizzes',
      description: 'Quiz and practice exam system',
    },
    {
      name: 'Requests',
      description: 'Material request system',
    },
    {
      name: 'Leaderboard',
      description: 'User rankings and reputation',
    },
    {
      name: 'Upload',
      description: 'File upload management',
    },
    {
      name: 'Search',
      description: 'Search functionality across all resources',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './src/modules/*/*.routes.js',
    './src/modules/index.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

