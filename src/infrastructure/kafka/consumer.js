const { Kafka } = require('kafkajs');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

const kafka = new Kafka({
  clientId: 'activity-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'activity-group' });

const repository = new ActivityLogRepository();

const startConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Kafka Consumer connected');

    await consumer.subscribe({
      topic: 'user-activity',
      fromBeginning: false
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const logData = JSON.parse(message.value.toString());

        await repository.save({
          ...logData,
          processedAt: new Date()
        });

        console.log(`Processed log | User: ${logData.userId} | Action: ${logData.action}`);
      }
    });

  } catch (error) {
    console.error('Kafka Consumer error:', error.message);
    throw error;
  }
};

module.exports = { startConsumer };