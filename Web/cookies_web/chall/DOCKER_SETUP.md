# Cookies Web CTF Challenge - Docker Setup Guide

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)

## Quick Start

### Build and Run with Docker Compose
```bash
# Navigate to the challenge directory
cd Web/cookies_web/chall

# Build images and start services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Access the Application
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Port Configuration for Multi-Challenge Deployment

If running both **cookies_web** and **sqli** challenges on the same server:

| Challenge | Frontend | Backend |
|-----------|----------|---------|
| cookies_web | 3000 | 5000 |
| sqli | 3001 | 5001 |

This prevents port conflicts and allows both to run simultaneously!

## Docker Images

### Frontend (React)
- **Base Image**: node:18-alpine
- **Build Process**: Multi-stage build
  1. Builder stage: Installs dependencies and builds React app
  2. Production stage: Uses `serve` to run the built application
- **Port**: 3001

### Backend (Express)
- **Base Image**: node:18-alpine
- **Dependencies**: Express, CORS, JWT, dotenv
- **Port**: 5000
- **Environment Variables**:
  - `NODE_ENV`: production
  - `PORT`: 5000
  - `SECRET_KEY`: super-secret-jwt-key-for-ctf

## Docker Compose Services

### Service: backend
- Container name: `cookies-ctf-backend`
- Runs on port `5000:5000`
- Health check enabled
- Automatically restarts on failure

### Service: frontend
- Container name: `cookies-ctf-frontend`
- Runs on port `3000:3000`
- Depends on backend service being healthy
- Health check enabled
- Automatically restarts on failure

### Network
- Both services are connected via `cookies-network` bridge network
- Enables inter-service communication

## Common Commands

### Build Images
```bash
docker-compose build
```

### Start Services (Foreground)
```bash
docker-compose up
```

### Start Services (Background)
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose stop
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### Execute Command in Container
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### View Service Status
```bash
docker-compose ps
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs

# Ensure ports 3000 and 5000 are not in use
netstat -an | grep -E ':(3000|5000)'
```

### Rebuild Everything
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Connection Issues Between Services
- Frontend should connect to backend at `http://backend:5000` (not localhost)
- The docker-compose file sets up the proxy automatically

### Clear Docker Resources
```bash
# Remove stopped containers
docker container prune

# Remove dangling images
docker image prune

# Remove unused volumes
docker volume prune
```

## Performance Notes

- First build may take 2-3 minutes due to dependency installation
- Subsequent builds are much faster due to Docker caching
- Multi-stage frontend build reduces final image size
- Alpine Linux base images keep container sizes small (~200MB each)

## Production Deployment

For production, consider:
1. Using environment-specific env files (`.env.production`)
2. Setting `SECRET_KEY` via environment variables, not hardcoded
3. Using a reverse proxy (nginx) for load balancing
4. Enabling Docker resource limits (memory, CPU)
5. Using container orchestration (Kubernetes, Docker Swarm)

## Health Checks

Both services include health checks:
- **Backend**: Checks `/api/health` endpoint
- **Frontend**: Checks root path with wget

These ensure services are properly running and responsive.

## File Structure
```
chall/
├── frontend/
│   ├── Dockerfile
│   ├── public/
│   │   ├── index.html
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── docker-compose.yml
└── DOCKER_SETUP.md (this file)
```
