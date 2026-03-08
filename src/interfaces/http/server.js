require('dotenv').config();

const express = require('express');
const connectDB = require('../../infrastructure/database/connection');
const { connectProducer } = require('../../infrastructure/kafka/producer');
const { startConsumer } = require('../../infrastructure/kafka/consumer');
const activityLogRoutes = require('./routes/activityLogRoutes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/logs', activityLogRoutes);

const start = async () => {
  try {
    await connectDB();
    await connectProducer();
    await startConsumer();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();