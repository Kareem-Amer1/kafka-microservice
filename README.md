# User Activity Logging Microservice

An event-driven microservice built with Node.js, Kafka, and MongoDB, following Domain-Driven Design (DDD) principles.

## Architecture

The system uses a producer-consumer pattern to decouple API ingestion from database persistence.

- **Interfaces**: REST API built with Express.
- **Application**: Business use cases for creating and retrieving logs.
- **Domain**: Core entities and repository interfaces (independent of infrastructure).
- **Infrastructure**: Kafka producer/consumer logic and MongoDB/Mongoose models.

```
[Client] -> [Post /api/logs] -> [Kafka Producer] -> [Kafka Topic] -> [Kafka Consumer] -> [MongoDB]
```

## Tech Stack

- **Runtime**: Node.js
- **Messaging**: Kafka (KRaft mode)
- **Database**: MongoDB
- **Containerization**: Docker & Kubernetes

## Local Development

### Requirements
- Docker Desktop
- Node.js (v20+)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment configuration**:
   Create a `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/activity-logs
   KAFKA_BROKER=localhost:9092
   PORT=3000
   KAFKAJS_NO_PARTITIONER_WARNING=1
   ```

3. **Start infrastructure**:
   ```bash
   docker-compose up -d
   ```

## API Reference

### POST `/api/logs`
Ingests a new activity log.

**Payload:**
```json
{
  "userId": "string",
  "action": "string",
  "metadata": {}
}
```

### GET `/api/logs`
Retrieves logs with support for filtering and pagination.

**Query Params:**
- `userId`: Filter by user
- `action`: Filter by action type
- `startDate/endDate`: Filter by date range
- `page/limit`: Pagination control

### GET `/health`
Service health check endpoint.