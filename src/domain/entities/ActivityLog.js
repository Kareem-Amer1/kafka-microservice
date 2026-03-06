class ActivityLog {
  constructor({ userId, action, metadata, timestamp }) {
    this.userId = userId;

    this.action = action;

    this.metadata = metadata || {};

    this.timestamp = timestamp || new Date();

    this.processedAt = null;
  }

  markAsProcessed() {
    this.processedAt = new Date();
  }

  validate() {
    if (!this.userId) throw new Error('userId is required');
    if (!this.action) throw new Error('action is required');
  }
}

module.exports = ActivityLog;