const { Kafka } = require('kafkajs');

let producer = null;

const connectProducer = async () => {
  try {
    const kafka = new Kafka({
      clientId: 'activity-producer', 
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']  
    });
    
    producer = kafka.producer();
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