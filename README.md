# Kafka Microservice — User Activity Logs

## Architecture Overview

This service follows an event-driven microservice architecture using DDD principles.

**Flow:**
1. Client sends `POST /api/logs` with user activity data
2. Express API receives the request and sends it to Kafka via the Producer
3. Kafka Consumer picks up the message and saves it to MongoDB
4. Client fetches processed logs via `GET /api/logs`

**Why Kafka?**
Kafka decouples ingestion from processing. Under high load, messages queue up in Kafka without overwhelming the database. The consumer processes them at its own pace, making the system resilient and scalable.

**Why DDD?**
Separates business logic from technical concerns. The domain layer has zero knowledge of MongoDB, Kafka, or Express — making each layer independently testable and replaceable.

## Tech Stack

| Technology | Role |
|---|---|
| Node.js + Express | HTTP server and REST API |
| KafkaJS | Kafka producer and consumer |
| Mongoose + MongoDB | Data persistence with indexed queries |
| Docker + Docker Compose | Local development environment |
| Kubernetes (GKE) | Cloud deployment and orchestration |

## Project Structure
```
src/
├── domain/          # Core business logic — no external dependencies
├── application/     # Use cases — orchestrates domain and infrastructure
├── infrastructure/  # Kafka, MongoDB, repositories
└── interfaces/      # HTTP routes and Express server
```

## Local Setup

### Prerequisites
- Node.js v20+
- Docker Desktop

### Steps

1. Clone the repo:
```
git clone https://github.com/Kareem-Amer1/kafka-microservice.git
cd kafka-microservice
```

2. Install dependencies:
```
npm install
```

3. Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/activity-logs
KAFKA_BROKER=localhost:9092
PORT=3000
KAFKAJS_NO_PARTITIONER_WARNING=1
```

4. Start Kafka and MongoDB:
```
docker-compose up -d
```

5. Start the app:
```
npm run dev
```

## API Documentation

### POST /api/logs
Send a new user activity log.

**Request Body:**
```json
{
  "userId": "user123",
  "action": "LOGIN",
  "metadata": { "browser": "Chrome", "ip": "192.168.1.1" }
}
```

**Response:**
```json
{
  "message": "Activity log accepted for processing"
}
```

---

### GET /api/logs
Fetch processed logs with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 10) |
| userId | string | Filter by user ID |
| action | string | Filter by action type |
| startDate | ISO date | Filter from this date |
| endDate | ISO date | Filter to this date |

**Example:**
```
GET /api/logs?userId=user123&action=LOGIN&page=1&limit=5
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 23,
    "totalPages": 5
  }
}
```

---

### GET /health
Returns service health status.

## Deployment

### Google Cloud (GKE)

1. Build and push Docker image:
```
docker build -t gcr.io/YOUR_PROJECT_ID/activity-service .
docker push gcr.io/YOUR_PROJECT_ID/activity-service
```

2. Create cluster:
```
gcloud container clusters create activity-cluster \
  --num-nodes=1 \
  --zone=us-central1-a \
  --machine-type=e2-micro
```

3. Deploy:
```
kubectl apply -f k8s/
```