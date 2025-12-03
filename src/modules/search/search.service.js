const Course = require('../course/course.model');
const CommunityNote = require('../community-note/communityNote.model');
const PastQuestion = require('../past-question/pastQuestion.model');
const OfficialNote = require('../official-note/officialNote.model');
const Quiz = require('../quiz/quiz.model');
const Request = require('../request/request.model');
const User = require('../user/user.model');
const { getPaginationParams } = require('../../shared/utils/helpers');

class SearchService {
  /**
   * Global search across all resources
   */
  async globalSearch(searchTerm, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit || 20);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        results: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
        },
      };
    }

    const searchRegex = new RegExp(searchTerm, 'i');

    // Search across all resource types in parallel
    const [courses, notes, pastQuestions, officialNotes, quizzes] = await Promise.all([
      Course.find({
        $or: [
          { title: searchRegex },
          { code: searchRegex },
          { description: searchRegex },
          { department: searchRegex },
        ],
        isActive: true,
      })
        .select('title code description department level')
        .populate('level', 'name code')
        .limit(10)
        .lean(),

      CommunityNote.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      })
        .select('title content authorId courseId upvotes downvotes createdAt')
        .populate('courseId', 'title code')
        .populate('authorId', 'name email')
        .limit(10)
        .lean(),

      PastQuestion.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
        isActive: true,
      })
        .select('title description course year semester downloadCount')
        .populate('course', 'title code')
        .limit(10)
        .lean(),

      OfficialNote.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
      })
        .select('title description category course downloadCount')
        .populate('course', 'title code')
        .limit(10)
        .lean(),

      Quiz.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
        isPublished: true,
        isActive: true,
      })
        .select('title description course difficulty attemptsCount')
        .populate('course', 'title code')
        .limit(10)
        .lean(),
    ]);

    // Format results with type identifiers
    const results = [
      ...courses.map(item => ({ ...item, type: 'course' })),
      ...notes.map(item => ({ ...item, type: 'community-note' })),
      ...pastQuestions.map(item => ({ ...item, type: 'past-question' })),
      ...officialNotes.map(item => ({ ...item, type: 'official-note' })),
      ...quizzes.map(item => ({ ...item, type: 'quiz' })),
    ];

    // Paginate combined results
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      results: paginatedResults,
      counts: {
        courses: courses.length,
        communityNotes: notes.length,
        pastQuestions: pastQuestions.length,
        officialNotes: officialNotes.length,
        quizzes: quizzes.length,
        total,
      },
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
   * Search courses
   */
  async searchCourses(searchTerm, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { courses: [], pagination: {} };
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    const filter = {
      $or: [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
      ],
      isActive: true,
    };

    // Apply additional filters
    if (queryParams.levelId) {
      filter.level = queryParams.levelId;
    }

    if (queryParams.semester) {
      filter.semester = queryParams.semester;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('level', 'name code')
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    return {
      courses,
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
   * Search community notes
   */
  async searchCommunityNotes(searchTerm, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { notes: [], pagination: {} };
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    const filter = {
      $or: [
        { title: searchRegex },
        { content: searchRegex },
      ],
    };

    // Apply additional filters
    if (queryParams.courseId) {
      filter.courseId = queryParams.courseId;
    }

    const [notes, total] = await Promise.all([
      CommunityNote.find(filter)
        .populate('courseId', 'title code')
        .populate('authorId', 'name email')
        .sort({ score: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CommunityNote.countDocuments(filter),
    ]);

    return {
      notes,
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
   * Search past questions
   */
  async searchPastQuestions(searchTerm, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { pastQuestions: [], pagination: {} };
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    const filter = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
      ],
      isActive: true,
    };

    // Apply additional filters
    if (queryParams.courseId) {
      filter.course = queryParams.courseId;
    }

    if (queryParams.year) {
      filter.year = parseInt(queryParams.year);
    }

    if (queryParams.semester) {
      filter.semester = queryParams.semester;
    }

    const [pastQuestions, total] = await Promise.all([
      PastQuestion.find(filter)
        .populate('course', 'title code')
        .populate('uploadedBy', 'name email')
        .sort({ year: -1, semester: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PastQuestion.countDocuments(filter),
    ]);

    return {
      pastQuestions,
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
   * Search users
   */
  async searchUsers(searchTerm, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { users: [], pagination: {} };
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
      isActive: true,
      isVerified: true,
    };

    // Apply additional filters
    if (queryParams.role) {
      filter.role = queryParams.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role reputationScore notesCreated profilePicture')
        .sort({ reputationScore: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
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
   * Get search suggestions (autocomplete)
   */
  async getSearchSuggestions(searchTerm, type = 'all') {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const searchRegex = new RegExp(`^${searchTerm}`, 'i');
    const suggestions = [];

    if (type === 'all' || type === 'courses') {
      const courses = await Course.find({
        $or: [
          { title: searchRegex },
          { code: searchRegex },
        ],
        isActive: true,
      })
        .select('title code')
        .limit(5)
        .lean();

      suggestions.push(...courses.map(c => ({
        text: `${c.code} - ${c.title}`,
        type: 'course',
        id: c._id,
      })));
    }

    if (type === 'all' || type === 'notes') {
      const notes = await CommunityNote.find({
        title: searchRegex,
      })
        .select('title')
        .limit(5)
        .lean();

      suggestions.push(...notes.map(n => ({
        text: n.title,
        type: 'community-note',
        id: n._id,
      })));
    }

    return suggestions.slice(0, 10);
  }

  /**
   * Get trending searches (most searched terms)
   * Note: This would require a search history tracking system
   * For now, return popular courses and notes
   */
  async getTrendingSearches() {
    const [popularCourses, popularNotes] = await Promise.all([
      Course.find({ isActive: true })
        .sort({ pastQuestionsCount: -1, communityNotesCount: -1 })
        .select('title code')
        .limit(5)
        .lean(),

      CommunityNote.find()
        .sort({ score: -1, saves: -1 })
        .select('title')
        .limit(5)
        .lean(),
    ]);

    return {
      courses: popularCourses.map(c => `${c.code} - ${c.title}`),
      notes: popularNotes.map(n => n.title),
    };
  }
}

module.exports = new SearchService();

