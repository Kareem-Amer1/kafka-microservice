const { Kafka } = require('kafkajs');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const ActivityLog = require('../../domain/entities/ActivityLog');

const repository = new ActivityLogRepository();

const startConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'activity-consumer',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });

    const consumer = kafka.consumer({ groupId: 'activity-group' });

    await consumer.connect();
    console.log('Kafka Consumer connected');

    await consumer.subscribe({
      topic: 'user-activity',
      fromBeginning: false
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const logData = JSON.parse(message.value.toString());

        // Use the domain entity to validate the message before persisting
        const activityLog = new ActivityLog(logData);
        activityLog.validate();
        activityLog.markAsProcessed();

        await repository.save({
          userId: activityLog.userId,
          action: activityLog.action,
          metadata: activityLog.metadata,
          timestamp: activityLog.timestamp,
          processedAt: activityLog.processedAt
        });

        console.log(`Processed log | User: ${activityLog.userId} | Action: ${activityLog.action}`);
      }
    });

  } catch (error) {
    console.error('Kafka Consumer error:', error.message);
    throw error;
  }
};

module.exports = { startConsumer };