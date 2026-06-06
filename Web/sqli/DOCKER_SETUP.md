# 🐳 Docker Setup for SQL Injection CTF Challenge

This guide explains how to run the entire SQL Injection CTF challenge using Docker.

## ✅ Prerequisites

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v1.29+) - Usually comes with Docker Desktop

### Verify Installation

```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start (Recommended)

The easiest way to run everything:

```bash
# Navigate to the project root
cd f:\VinterBashCTF-2026\sqli

# Start both backend and frontend with one command
docker-compose up
```

This will:
1. ✅ Build the backend image
2. ✅ Build the frontend image
3. ✅ Create a shared network
4. ✅ Start the backend on port 5000
5. ✅ Start the frontend on port 3000

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Detailed Commands

### Build Docker Images

```bash
# Build both services
docker-compose build

# Build only backend
docker-compose build backend

# Build only frontend
docker-compose build frontend
```

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
# Stop all containers
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Manage Containers

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend npm start

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│     Docker Compose Network      │
│  (sqli-network: bridge driver)  │
│                                 │
│  ┌──────────────┐  ┌──────────┐│
│  │   Frontend   │  │ Backend  ││
│  │  React: 3000 │  │Node: 5000││
│  │ (serve)      │  │(Express) ││
│  └──────────────┘  └──────────┘│
│         ↓                ↓       │
│     localhost:3000  localhost:5000
└─────────────────────────────────┘
```

## 📁 File Structure

```
sqli/
├── docker-compose.yml        (Orchestration)
├── backend/
│   ├── Dockerfile           (Backend image)
│   ├── .dockerignore
│   ├── server.js
│   ├── package.json
│   └── database.db
└── frontend/
    ├── Dockerfile           (Frontend image)
    ├── .dockerignore
    ├── src/
    ├── public/
    └── package.json
```

## 🔧 Backend Dockerfile Explanation

```dockerfile
FROM node:18-alpine          # Lightweight Node.js image
WORKDIR /app                 # Set working directory
COPY package.json .          # Copy dependencies
RUN npm install              # Install packages
COPY server.js .             # Copy application code
EXPOSE 5000                  # Expose port
CMD ["npm", "start"]         # Start command
```

## 🔧 Frontend Dockerfile Explanation (Multi-stage)

```dockerfile
# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY src/ public/ .
RUN npm run build             # Build React app

# Stage 2: Runtime (optimized)
FROM node:18-alpine
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build"]
```

## 📊 Docker Compose Configuration

```yaml
version: '3.8'

services:
  backend:
    build: ./backend              # Build from backend folder
    container_name: sqli-ctf-backend
    ports:
      - "5000:5000"               # Map port
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/database.db:/app/database.db  # Persist DB
    networks:
      - sqli-network              # Shared network
    healthcheck:                  # Health monitoring
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend                   # Start backend first
    networks:
      - sqli-network

networks:
  sqli-network:
    driver: bridge
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill process
taskkill /PID <PID> /F
```

### Database Persistence

The `docker-compose.yml` maps the database volume:
```yaml
volumes:
  - ./backend/database.db:/app/database.db
```

This ensures data persists even when containers restart.

### Clear Everything and Start Fresh

```bash
docker-compose down -v              # Remove containers & volumes
docker-compose build --no-cache     # Rebuild without cache
docker-compose up                   # Start fresh
```

### Check Logs for Errors

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Container Won't Start

```bash
# Rebuild specific service
docker-compose up --build backend

# Run with verbose logging
docker-compose up --verbose
```

## 🚀 Production Deployment

### Using Environment Variables

Create a `.env` file:
```
NODE_ENV=production
API_URL=https://your-api-domain.com
```

Update `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - NODE_ENV=${NODE_ENV}
      - API_URL=${API_URL}
```

### Building Optimized Images

```bash
# Build without Docker Compose
docker build -t sqli-backend:latest ./backend
docker build -t sqli-frontend:latest ./frontend

# Push to registry (Docker Hub, ECR, etc.)
docker push sqli-backend:latest
docker push sqli-frontend:latest
```

## 📚 Useful Docker Commands

```bash
# View image layers
docker history sqli-ctf-backend

# Inspect container
docker inspect sqli-ctf-backend

# View resource usage
docker stats

# Remove unused images
docker image prune

# View all networks
docker network ls

# Inspect network
docker network inspect sqli_sqli-network
```

## 🔐 Security Notes

- Database file is mapped as a volume for persistence
- Services communicate via internal Docker network
- No hardcoded credentials (best practice)
- Use `.dockerignore` to exclude sensitive files

## 💾 Database Backup/Restore

### Backup Database from Container

```bash
docker cp sqli-ctf-backend:/app/database.db ./backup.db
```

### Restore Database

```bash
docker cp ./backup.db sqli-ctf-backend:/app/database.db
docker-compose restart backend
```

## 🎓 Common Workflows

### Development Workflow

```bash
# Start containers
docker-compose up -d

# Make code changes (they don't auto-reload in Docker)
# Edit files locally

# Rebuild and restart
docker-compose up --build

# View logs
docker-compose logs -f
```

### Testing Workflow

```bash
# Run container with different command
docker-compose run backend npm test

# Access shell in running container
docker-compose exec backend sh
```

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**That's it! You're ready to run the entire CTF challenge in Docker! 🚀**
