const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'activity-producer', 
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']  
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (error) {
    console.error('Kafka Producer connection failed:', error.message);
    throw error;
  }
};

const sendActivityLog = async (logData) => {
  await producer.send({
    topic: 'user-activity', 
    messages: [
      {
        value: JSON.stringify(logData),

        key: logData.userId
      }
    ]
  });

  console.log(`Sent activity log for user: ${logData.userId}`);
};

module.exports = { connectProducer, sendActivityLog };