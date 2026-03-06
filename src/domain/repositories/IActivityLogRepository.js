class IActivityLogRepository {
  async save(activityLog) {
    throw new Error('save() must be implemented');
  }

  async findAll({ filter, page, limit }) {
    throw new Error('findAll() must be implemented');
  }

  async count(filter) {
    throw new Error('count() must be implemented');
  }
}

module.exports = IActivityLogRepository;