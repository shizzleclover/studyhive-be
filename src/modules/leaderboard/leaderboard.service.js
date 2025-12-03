const User = require('../user/user.model');
const { getPaginationParams } = require('../../shared/utils/helpers');

class LeaderboardService {
  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit || 50);
    
    const filter = {
      isActive: true,
      isVerified: true,
    };

    // Filter by role if specified
    if (queryParams.role) {
      filter.role = queryParams.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role reputationScore notesCreated quizzesTaken quizCorrectAnswers profilePicture')
        .sort({ reputationScore: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Add ranking
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    return {
      users: rankedUsers,
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
   * Get top contributors (users with most notes created)
   */
  async getTopContributors(limit = 10) {
    const users = await User.find({
      isActive: true,
      isVerified: true,
      notesCreated: { $gt: 0 },
    })
      .select('name email role reputationScore notesCreated profilePicture')
      .sort({ notesCreated: -1, reputationScore: -1 })
      .limit(limit)
      .lean();

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  /**
   * Get quiz champions (users with highest quiz scores)
   */
  async getQuizChampions(limit = 10) {
    const users = await User.find({
      isActive: true,
      isVerified: true,
      quizzesTaken: { $gt: 0 },
    })
      .select('name email role reputationScore quizzesTaken quizCorrectAnswers profilePicture')
      .sort({ quizCorrectAnswers: -1, quizzesTaken: -1 })
      .limit(limit)
      .lean();

    return users.map((user, index) => {
      const accuracy = user.quizzesTaken > 0 
        ? Math.round((user.quizCorrectAnswers / (user.quizzesTaken * 10)) * 100) // Assuming avg 10 questions per quiz
        : 0;
      
      return {
        ...user,
        rank: index + 1,
        accuracy,
      };
    });
  }

  /**
   * Get user's leaderboard position
   */
  async getUserPosition(userId) {
    const user = await User.findById(userId)
      .select('name email role reputationScore notesCreated quizzesTaken quizCorrectAnswers profilePicture')
      .lean();

    if (!user) {
      return null;
    }

    // Calculate global rank
    const higherRankedCount = await User.countDocuments({
      isActive: true,
      isVerified: true,
      reputationScore: { $gt: user.reputationScore },
    });

    const globalRank = higherRankedCount + 1;

    // Calculate role-specific rank
    const roleHigherRankedCount = await User.countDocuments({
      isActive: true,
      isVerified: true,
      role: user.role,
      reputationScore: { $gt: user.reputationScore },
    });

    const roleRank = roleHigherRankedCount + 1;

    // Get total users in leaderboard
    const totalUsers = await User.countDocuments({
      isActive: true,
      isVerified: true,
    });

    const totalRoleUsers = await User.countDocuments({
      isActive: true,
      isVerified: true,
      role: user.role,
    });

    // Calculate percentile
    const percentile = totalUsers > 1 
      ? Math.round(((totalUsers - globalRank) / (totalUsers - 1)) * 100)
      : 100;

    return {
      user,
      globalRank,
      roleRank,
      totalUsers,
      totalRoleUsers,
      percentile,
    };
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats() {
    const [
      totalUsers,
      totalReputation,
      totalNotes,
      totalQuizzesTaken,
      topUser,
    ] = await Promise.all([
      User.countDocuments({ isActive: true, isVerified: true }),
      User.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: null, total: { $sum: '$reputationScore' } } },
      ]),
      User.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: null, total: { $sum: '$notesCreated' } } },
      ]),
      User.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: null, total: { $sum: '$quizzesTaken' } } },
      ]),
      User.findOne({ isActive: true, isVerified: true })
        .select('name reputationScore')
        .sort({ reputationScore: -1 })
        .lean(),
    ]);

    return {
      totalUsers,
      totalReputation: totalReputation[0]?.total || 0,
      averageReputation: totalUsers > 0 ? Math.round((totalReputation[0]?.total || 0) / totalUsers) : 0,
      totalNotes: totalNotes[0]?.total || 0,
      totalQuizzesTaken: totalQuizzesTaken[0]?.total || 0,
      topUser,
    };
  }

  /**
   * Get users near a specific user on the leaderboard
   */
  async getUsersNearby(userId, range = 5) {
    const user = await User.findById(userId).select('reputationScore').lean();
    
    if (!user) {
      return [];
    }

    // Get users with scores above and below
    const [usersAbove, usersBelow] = await Promise.all([
      User.find({
        isActive: true,
        isVerified: true,
        reputationScore: { $gte: user.reputationScore },
      })
        .select('name email role reputationScore profilePicture')
        .sort({ reputationScore: -1, createdAt: 1 })
        .limit(range + 1)
        .lean(),
      User.find({
        isActive: true,
        isVerified: true,
        reputationScore: { $lt: user.reputationScore },
      })
        .select('name email role reputationScore profilePicture')
        .sort({ reputationScore: -1, createdAt: 1 })
        .limit(range)
        .lean(),
    ]);

    // Combine and sort
    const nearbyUsers = [...usersAbove, ...usersBelow]
      .sort((a, b) => b.reputationScore - a.reputationScore);

    // Calculate ranks
    const startRank = await User.countDocuments({
      isActive: true,
      isVerified: true,
      reputationScore: { $gt: nearbyUsers[0]?.reputationScore || user.reputationScore },
    }) + 1;

    return nearbyUsers.map((u, index) => ({
      ...u,
      rank: startRank + index,
      isCurrentUser: u._id.toString() === userId,
    }));
  }
}

module.exports = new LeaderboardService();
