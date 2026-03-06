const ActivityLogRepository = require('../../infrastructure/repositories/ActivityLogRepository');

class GetActivityLogs {
  constructor() {
    this.repository = new ActivityLogRepository();
  }

  async execute({ page = 1, limit = 10, userId, action, startDate, endDate }) {
    const filter = {};

    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate)   filter.timestamp.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.repository.findAll({ filter, page, limit }),
      this.repository.count(filter)
    ]);

    return {
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetActivityLogs;