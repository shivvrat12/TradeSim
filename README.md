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

> 📽️ [Demo Video Placeholder](#)  
> ![Screenshot Placeholder](./screenshots/dashboard.png)

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
