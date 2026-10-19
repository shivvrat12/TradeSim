# 📈 TradeSim — Full-Stack Paper Trading Simulator

[![Java](https://img.shields.io/badge/Backend-Java-blue?logo=openjdk)](https://www.java.com/)
[![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org/)
[![Kafka](https://img.shields.io/badge/EventBus-Kafka-000000?logo=apachekafka)](https://kafka.apache.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Containerized-Docker-blue?logo=docker)](https://www.docker.com/)
[![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)](https://jwt.io/)

---

## 🧠 Overview

**TradeSim** is a scalable, real-time **paper trading simulator** that mimics stock and crypto trading using **real-time market data** from Binance. It's built with modern microservices architecture, optimized with Redis caching, and uses Kafka for event-driven workflows.

> 💡 Ideal for those who want to practice trading strategies with virtual money — no real transactions involved.

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React, Tailwind CSS, Axios, WebSocket |
| Backend     | Java + Spring Boot (Microservices) |
| Auth        | JWT Tokens (Stateless Authentication) |
| Messaging   | Apache Kafka |
| Caching     | Redis |
| Database    | PostgreSQL |
| Market Feed | Binance WebSocket |
| Containerization | Docker & Docker Compose |

---

## 🧩 Microservices

| Service            | Description |
|--------------------|-------------|
| **auth-service**   | Handles registration, login, and JWT-based auth |
| **trade-service**  | Places and sells virtual orders via Kafka |
| **portfolio-service** | Tracks holdings and balance per user |
| **market-service** | Connects to Binance WebSocket and caches real-time crypto prices |

---

## 🖼️ Screenshots & Demo

> 📂 [View Screenshots & Demo Folder](https://drive.google.com/drive/folders/1TiRF66rLAcRtF7g-Q4PAJS4K-YlIP0j7?usp=drive_link)

---

## More About this project

🐳 Ensure Docker and Docker Compose are installed before running.

🔐 Authentication Flow
User signs up → auth-service generates a JWT.

JWT is included in all protected API requests.

Other services decode the token for user identity.

🔄 Event-Driven Flow
When a user places a trade:

trade-service sends a Kafka event.

portfolio-service consumes and updates user’s holdings and balance.

🌐 CORS Setup
CORS is configured to allow requests from:

http://localhost:3000 (Dev)

Your production domain (e.g., https://tradesim.xyz)

📌 Project Status
✅ Local deployment with Docker Compose
✅ Fully functional paper trading backend
🔄 Real-time market updates with Binance WebSocket
🚧 Hosting/Deployment skipped for cost-efficiency (demo via video/screenshots)

🙌 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss.

📜 License
This project is open source under the MIT License.

✨ Created By
Shiv Vrat Raghuvanshi
🎓 BCA Final Year | Java, Spring Boot & Android Enthusiast
📫 LinkedIn • GitHub

---

## 🚀 How to Run Locally

```bash
# Step 1: Clone the project
git clone https://github.com/yourusername/tradesim.git
cd tradesim

# Step 2: Run all services
docker-compose up --build

# Step 3: Run the Front End with the help of React and Vite
cd tradesimFronrEnd
npm run dev


### Run locally without Docker (macOS + Homebrew)

Uses Homebrew Postgres, Redis and Kafka (KRaft mode, no Zookeeper) instead of containers.

```bash
# One-time setup
brew install postgresql@14 redis kafka
brew services start postgresql@14 && brew services start redis && brew services start kafka
psql -d postgres -c "CREATE ROLE shiv LOGIN PASSWORD '123';" -c "CREATE DATABASE tradesimdb OWNER shiv;"

# Backend: builds the jars and starts all four services with the `local` Spring profile
cd tradesimBackend
./run-local.sh start      # also: stop | status | logs <service>

# Frontend
cd ../tradesimFronrEnd/tradeSim
npm install && npm run dev   # http://localhost:5173
```

