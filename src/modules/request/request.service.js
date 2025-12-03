const Request = require('./request.model');
const Course = require('../course/course.model');
const ApiError = require('../../shared/utils/ApiError');
const { getPaginationParams } = require('../../shared/utils/helpers');

class RequestService {
  /**
   * Create a new request
   */
  async createRequest(requestData, userId) {
    // Verify course exists
    const course = await Course.findById(requestData.course);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const request = await Request.create({
      ...requestData,
      createdBy: userId,
    });

    return request.populate('course createdBy', 'title code name email');
  }

  /**
   * Get all requests with filtering and pagination
   */
  async getAllRequests(queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    const filter = { isActive: true };
    
    // Filter by course
    if (queryParams.courseId) {
      filter.course = queryParams.courseId;
    }
    
    // Filter by request type
    if (queryParams.requestType) {
      filter.requestType = queryParams.requestType;
    }
    
    // Filter by status
    if (queryParams.status) {
      filter.status = queryParams.status;
    }
    
    // Sort options
    let sortOption = { priority: -1, createdAt: -1 }; // Default: high priority first
    if (queryParams.sortBy === 'recent') {
      sortOption = { createdAt: -1 };
    } else if (queryParams.sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('course', 'title code')
        .populate('createdBy', 'name email')
        .populate('fulfilledBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Request.countDocuments(filter),
    ]);

    return {
      requests,
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
   * Get request by ID
   */
  async getRequestById(requestId) {
    const request = await Request.findById(requestId)
      .populate('course', 'title code')
      .populate('createdBy', 'name email')
      .populate('fulfilledBy', 'name email')
      .populate('rejectedBy', 'name email')
      .lean();

    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    return request;
  }

  /**
   * Get requests by course
   */
  async getRequestsByCourse(courseId, queryParams) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    const filter = { 
      course: courseId,
      isActive: true,
    };

    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    if (queryParams.requestType) {
      filter.requestType = queryParams.requestType;
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('createdBy', 'name email')
        .populate('fulfilledBy', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Request.countDocuments(filter),
    ]);

    return {
      requests,
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
   * Get user's requests
   */
  async getUserRequests(userId, queryParams) {
    const { page, limit, skip } = getPaginationParams(queryParams.page, queryParams.limit);
    
    const filter = { 
      createdBy: userId,
      isActive: true,
    };

    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('course', 'title code')
        .populate('fulfilledBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Request.countDocuments(filter),
    ]);

    return {
      requests,
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
   * Update request
   */
  async updateRequest(requestId, updateData, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    // Check ownership
    if (request.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to update this request');
    }

    // Only allow updates if request is still pending
    if (request.status !== 'pending') {
      throw new ApiError(400, 'Cannot update request that is no longer pending');
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'description', 'specificDetails'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        request[key] = updateData[key];
      }
    });

    await request.save();

    return request.populate('course createdBy', 'title code name email');
  }

  /**
   * Delete request
   */
  async deleteRequest(requestId, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    // Check ownership
    if (request.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to delete this request');
    }

    // Soft delete
    request.isActive = false;
    await request.save();

    return { message: 'Request deleted successfully' };
  }

  /**
   * Vote on request (upvote/downvote)
   */
  async voteOnRequest(requestId, voteType, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (voteType === 'upvote') {
      request.upvotes += 1;
    } else if (voteType === 'downvote') {
      request.downvotes += 1;
    } else {
      throw new ApiError(400, 'Invalid vote type');
    }

    await request.save();

    return request;
  }

  /**
   * Mark request as in progress (Rep/Admin)
   */
  async markInProgress(requestId, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Request is not in pending status');
    }

    request.status = 'in-progress';
    await request.save();

    return request.populate('course createdBy', 'title code name email');
  }

  /**
   * Fulfill request (Rep/Admin)
   */
  async fulfillRequest(requestId, fulfillmentData, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.status === 'fulfilled' || request.status === 'rejected') {
      throw new ApiError(400, 'Request is already fulfilled or rejected');
    }

    request.status = 'fulfilled';
    request.fulfilledBy = userId;
    request.fulfilledAt = new Date();
    request.fulfillmentNote = fulfillmentData.note;
    request.fulfillmentResourceId = fulfillmentData.resourceId;
    request.fulfillmentResourceType = fulfillmentData.resourceType;

    await request.save();

    return request.populate('course createdBy fulfilledBy', 'title code name email');
  }

  /**
   * Reject request (Rep/Admin)
   */
  async rejectRequest(requestId, rejectionReason, userId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Request not found');
    }

    if (request.status === 'fulfilled' || request.status === 'rejected') {
      throw new ApiError(400, 'Request is already fulfilled or rejected');
    }

    request.status = 'rejected';
    request.rejectedBy = userId;
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();

    return request.populate('course createdBy rejectedBy', 'title code name email');
  }

  /**
   * Get request statistics
   */
  async getRequestStats(courseId = null) {
    const filter = courseId ? { course: courseId, isActive: true } : { isActive: true };

    const stats = await Request.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {
      pending: 0,
      'in-progress': 0,
      fulfilled: 0,
      rejected: 0,
    };

    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    return {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      ...statsMap,
    };
  }
}

module.exports = new RequestService();
