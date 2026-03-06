const IActivityLogRepository = require('../../domain/repositories/IActivityLogRepository');
const ActivityLogModel = require('../database/ActivityLogModel');

class ActivityLogRepository extends IActivityLogRepository {

  async save(activityLog) {
    const doc = await ActivityLogModel.create(activityLog);
    return doc;
  }

  async findAll({ filter = {}, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const logs = await ActivityLogModel
      .find(filter)
      .sort({ timestamp: -1 })  
      .skip(skip)                
      .limit(Number(limit));     

    return logs;
  }

  async count(filter = {}) {
    return await ActivityLogModel.countDocuments(filter);
  }
}

module.exports = ActivityLogRepository;