const ActivityLog = require('../../domain/entities/ActivityLog');
const { sendActivityLog } = require('../../infrastructure/kafka/producer');

class CreateActivityLog {
  async execute({ userId, action, metadata }) {
    const log = new ActivityLog({ userId, action, metadata });
    log.validate();

    await sendActivityLog({
      userId: log.userId,
      action: log.action,
      metadata: log.metadata,
      timestamp: log.timestamp
    });

    return { message: 'Activity log accepted for processing' };
  }
}

module.exports = CreateActivityLog;