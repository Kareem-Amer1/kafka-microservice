# Kafka Microservice - User Activity Logs

## Architecture Overview

This service is an event-driven microservice that follows **Domain-Driven Design (DDD)** principles. The system is structured around the **user activity log** domain — ingesting logs via Kafka and persisting them in MongoDB for querying.

```
┌─────────────┐     POST /api/logs      ┌──────────────────┐
│   Client    │ ───────────────────────► │  Express REST API │
└─────────────┘                          └────────┬─────────┘
                                                  │ Kafka Producer
                                                  ▼
                                         ┌─────────────────┐
                                         │   Kafka Topic   │
                                         │ (user-activity) │
                                         └────────┬────────┘
                                                  │ Kafka Consumer
                                                  ▼
                                         ┌─────────────────┐
                                         │    MongoDB       │
                                         │ (activity-logs) │
                                         └────────┬────────┘
                                                  │
                          GET /api/logs ◄──────────┘
```

### Why Kafka?
Kafka decouples ingestion from processing. Under high load, messages queue up in Kafka without overwhelming the database. The consumer processes them at its own pace, making the system resilient and horizontally scalable.

### Why DDD?
Separates business logic from technical concerns. The `domain` layer has zero knowledge of MongoDB, Kafka, or Express — making each layer independently testable and replaceable.

```
src/
├── domain/          # Core business logic — no external dependencies
│   ├── entities/    # ActivityLog entity with validate() / markAsProcessed()
│   └── repositories/# IActivityLogRepository interface
├── application/     # Use cases — orchestrates domain + infrastructure
│   └── usecases/   # CreateActivityLog, GetActivityLogs
├── infrastructure/  # Kafka producer/consumer, MongoDB model, repository impl
│   ├── kafka/
│   ├── database/
│   └── repositories/
└── interfaces/      # HTTP layer — Express routes and server bootstrap
    └── http/
```

## Tech Stack

| Technology | Role |
|---|---|
| Node.js + Express | HTTP server and REST API |
| KafkaJS | Kafka producer and consumer |
| Mongoose + MongoDB | Data persistence with indexed queries |
| Docker + Docker Compose | Local development environment |
| Kubernetes (GKE) | Cloud deployment and orchestration |

---

## Local Setup

### Prerequisites
- Node.js v20+
- Docker Desktop

### Steps

1. Clone the repo:
```bash
git clone https://github.com/Kareem-Amer1/kafka-microservice.git
cd kafka-microservice
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/activity-logs
KAFKA_BROKER=localhost:9092
PORT=3000
KAFKAJS_NO_PARTITIONER_WARNING=1
```

4. Start all infrastructure (Kafka + Zookeeper + MongoDB) and the app:
```bash
docker-compose up --build -d
```

5. Verify all containers are running:
```bash
docker-compose ps
```

6. (Optional) Run the app locally outside Docker while keeping infrastructure in Docker:
```bash
# Start only infrastructure
docker-compose up -d zookeeper kafka mongodb

# Run app
npm run dev
```

---

## API Documentation

### POST /api/logs
Send a new user activity log. The request is validated, published to Kafka, and the consumer persists it to MongoDB asynchronously.

**Request Body:**
```json
{
  "userId": "user123",
  "action": "LOGIN",
  "metadata": { "browser": "Chrome", "ip": "192.168.1.1" }
}
```

**Response (202 Accepted):**
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
| startDate | ISO date | Filter logs from this date |
| endDate | ISO date | Filter logs up to this date |

**Example:**
```
GET /api/logs?userId=user123&action=LOGIN&page=1&limit=5
```

**Response:**
```json
{
  "data": [ ... ],
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
Returns service health status. Used by Kubernetes readiness and liveness probes.

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Deployment (Google Kubernetes Engine — Free Tier)

### Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated
- Docker installed
- A GCP project created

### 1. Authenticate and set your project
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker
```

### 2. Build and push the Docker image
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/activity-service:latest .
docker push gcr.io/YOUR_PROJECT_ID/activity-service:latest
```

### 3. Create a GKE cluster (free-tier eligible)
```bash
gcloud container clusters create activity-cluster \
  --num-nodes=1 \
  --zone=us-central1-a \
  --machine-type=e2-micro
```

### 4. Get cluster credentials
```bash
gcloud container clusters get-credentials activity-cluster --zone=us-central1-a
```

### 5. Update the image name in app.yaml
Open `k8s/app.yaml` and replace `YOUR_PROJECT_ID` with your actual GCP project ID:
```yaml
image: gcr.io/YOUR_PROJECT_ID/activity-service:latest
```

### 6. Apply all Kubernetes manifests
```bash
kubectl apply -f k8s/
```

### 7. Check deployment status
```bash
kubectl get pods
kubectl get services
```

### 8. Get the external IP of the service
```bash
kubectl get service activity-service
```
Wait until `EXTERNAL-IP` is no longer `<pending>`, then access:
```
http://EXTERNAL-IP/health
http://EXTERNAL-IP/api/logs
```

---

## K8s Manifest Summary

| File | What it deploys |
|---|---|
| `k8s/configmap.yaml` | Non-sensitive env vars (KAFKA_BROKER, PORT) |
| `k8s/zookeeper-kafka.yaml` | Zookeeper + Kafka (KRaft mode) Deployments + Services |
| `k8s/mongodb.yaml` | MongoDB Deployment + PersistentVolumeClaim (1Gi) + Service |
| `k8s/app.yaml` | Activity Service Deployment (2 replicas) + LoadBalancer Service |