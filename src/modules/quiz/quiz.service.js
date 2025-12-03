const Quiz = require('./quiz.model');
const QuizAttempt = require('./quizAttempt.model');
const Course = require('../course/course.model');
const User = require('../user/user.model');
const ApiError = require('../../shared/utils/ApiError');
const { getPaginationParams } = require('../../shared/utils/helpers');

class QuizService {
  /**
   * Create a new quiz
   */
  async createQuiz(quizData, userId) {
    // Verify course exists
    const course = await Course.findById(quizData.course);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Validate questions have correct answers
    for (const question of quizData.questions) {
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        throw new ApiError(400, `Question "${question.questionText}" must have at least one correct answer`);
      }
    }

    const quiz = await Quiz.create({
      ...quizData,
      createdBy: userId,
    });

    // Update course quiz count
    await Course.findByIdAndUpdate(quizData.course, {
      $inc: { quizzesCount: 1 },
    });

    return quiz.populate('course createdBy', 'title code name email');
  }

  /**
   * Get all quizzes with filtering and pagination
   */
  async getAllQuizzes(queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    const filter = {};
    
    // Filter by published status (students only see published)
    if (queryParams.published !== undefined) {
      filter.isPublished = queryParams.published === 'true';
    }
    
    // Filter by course
    if (queryParams.courseId) {
      filter.course = queryParams.courseId;
    }
    
    // Filter by difficulty
    if (queryParams.difficulty) {
      filter.difficulty = queryParams.difficulty;
    }
    
    // Filter by active status
    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .populate('course', 'title code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quiz.countDocuments(filter),
    ]);

    // Hide correct answers from response (students shouldn't see them before attempting)
    const sanitizedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options.map(opt => ({ text: opt.text })),
        points: q.points,
      })),
    }));

    return {
      quizzes: sanitizedQuizzes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId, userId, isAttempting = false) {
    const quiz = await Quiz.findById(quizId)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .lean();

    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // If user is attempting, don't show correct answers
    if (isAttempting) {
      quiz.questions = quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options.map(opt => ({ text: opt.text })),
        points: q.points,
        explanation: undefined, // Hide explanation until after submission
      }));
    }

    return quiz;
  }

  /**
   * Get quizzes by course
   */
  async getQuizzesByCourse(courseId, queryParams) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    const filter = { 
      course: courseId,
      isPublished: true, // Only show published quizzes
      isActive: true,
    };

    if (queryParams.difficulty) {
      filter.difficulty = queryParams.difficulty;
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .select('-questions') // Don't send questions in list view
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quiz.countDocuments(filter),
    ]);

    return {
      quizzes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId, updateData, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Check ownership
    if (quiz.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to update this quiz');
    }

    // Validate questions if provided
    if (updateData.questions) {
      for (const question of updateData.questions) {
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          throw new ApiError(400, `Question "${question.questionText}" must have at least one correct answer`);
        }
      }
    }

    Object.assign(quiz, updateData);
    await quiz.save();

    return quiz.populate('course createdBy', 'title code name email');
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Check ownership
    if (quiz.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to delete this quiz');
    }

    // Delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: quizId });

    // Update course quiz count
    await Course.findByIdAndUpdate(quiz.course, {
      $inc: { quizzesCount: -1 },
    });

    await quiz.deleteOne();

    return { message: 'Quiz and all attempts deleted successfully' };
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(quizId, answers, timeSpent, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    if (!quiz.isPublished || !quiz.isActive) {
      throw new ApiError(400, 'Quiz is not available for attempts');
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const attemptCount = await QuizAttempt.countDocuments({ quiz: quizId, user: userId });
      if (attemptCount >= quiz.maxAttempts) {
        throw new ApiError(400, `Maximum attempts (${quiz.maxAttempts}) reached`);
      }
    }

    // Validate all questions are answered
    if (answers.length !== quiz.questions.length) {
      throw new ApiError(400, 'All questions must be answered');
    }

    // Calculate score
    let correctAnswers = 0;
    let pointsEarned = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        throw new ApiError(400, `Invalid question ID: ${answer.questionId}`);
      }

      const selectedOption = question.options[answer.selectedOptionIndex];
      if (!selectedOption) {
        throw new ApiError(400, `Invalid option index for question: ${answer.questionId}`);
      }

      const isCorrect = selectedOption.isCorrect;
      if (isCorrect) {
        correctAnswers++;
        pointsEarned += question.points;
      }

      return {
        questionId: answer.questionId,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    });

    const score = Math.round((pointsEarned / totalPoints) * 100);
    const isPassed = score >= quiz.passingScore;

    // Get attempt number
    const attemptNumber = await QuizAttempt.countDocuments({ quiz: quizId, user: userId }) + 1;

    // Create attempt
    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      answers: processedAnswers,
      score,
      pointsEarned,
      totalPoints,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      isPassed,
      timeSpent,
      startedAt: new Date(Date.now() - timeSpent * 1000),
      submittedAt: new Date(),
      attemptNumber,
    });

    // Update quiz statistics
    const allAttempts = await QuizAttempt.find({ quiz: quizId });
    const avgScore = allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;
    const passCount = allAttempts.filter(a => a.isPassed).length;
    const passRate = (passCount / allAttempts.length) * 100;

    await Quiz.findByIdAndUpdate(quizId, {
      attemptsCount: allAttempts.length,
      averageScore: Math.round(avgScore),
      passRate: Math.round(passRate),
    });

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: {
        quizzesTaken: 1,
        quizCorrectAnswers: correctAnswers,
      },
    });

    return attempt.populate('quiz user', 'title description name email');
  }

  /**
   * Get user's attempts for a quiz
   */
  async getUserQuizAttempts(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    const attempts = await QuizAttempt.find({ quiz: quizId, user: userId })
      .sort({ attemptNumber: -1 })
      .lean();

    return attempts;
  }

  /**
   * Get all user attempts
   */
  async getAllUserAttempts(userId, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);

    const [attempts, total] = await Promise.all([
      QuizAttempt.find({ user: userId })
        .populate('quiz', 'title description course difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuizAttempt.countDocuments({ user: userId }),
    ]);

    return {
      attempts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get attempt details with answers (for review)
   */
  async getAttemptDetails(attemptId, userId) {
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz')
      .populate('user', 'name email')
      .lean();

    if (!attempt) {
      throw new ApiError(404, 'Attempt not found');
    }

    // Check ownership
    if (attempt.user._id.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to view this attempt');
    }

    // Check if review is allowed
    if (!attempt.quiz.allowReview) {
      throw new ApiError(403, 'Review is not allowed for this quiz');
    }

    // Enrich answers with question details
    const enrichedAnswers = attempt.answers.map(answer => {
      const question = attempt.quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
      return {
        ...answer,
        question: {
          questionText: question.questionText,
          options: question.options,
          explanation: question.explanation,
        },
      };
    });

    return {
      ...attempt,
      answers: enrichedAnswers,
    };
  }

  /**
   * Publish/unpublish quiz
   */
  async togglePublishStatus(quizId, userId, isPublished) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Check ownership
    if (quiz.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to publish/unpublish this quiz');
    }

    quiz.isPublished = isPublished;
    await quiz.save();

    return quiz;
  }
}

module.exports = new QuizService();
