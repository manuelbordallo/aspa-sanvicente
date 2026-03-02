# Design Document - Frontend Docker Deployment

## Overview

Este diseño mejora el sistema de despliegue Docker del frontend, proporcionando una solución robusta, optimizada y fácil de usar para diferentes entornos. La solución incluye:

- Dockerfile multi-stage optimizado
- Configuración Docker Compose para múltiples entornos
- Scripts de automatización para despliegue
- Integración con el backend existente
- Documentación completa

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Environment                       │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Frontend        │         │  Backend         │         │
│  │  Container       │◄────────┤  Container       │         │
│  │  (nginx:alpine)  │  API    │  (node:20)       │         │
│  │  Port: 8080      │         │  Port: 3000      │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                              │                     │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
│                  ┌─────▼─────┐                              │
│                  │ PostgreSQL │                              │
│                  │ Container  │                              │
│                  │ Port: 5432 │                              │
│                  └────────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Port Mapping
                         ▼
                  ┌──────────────┐
                  │   Host OS    │
                  │ localhost    │
                  └──────────────┘
```

### Build Process Flow

```
┌─────────────┐
│ Source Code │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Stage 1: Builder (node:20-alpine)  │
│  - Install dependencies (npm ci)    │
│  - Copy source code                 │
│  - Build with Vite                  │
│  - Output: /app/dist                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Stage 2: Production (nginx:alpine) │
│  - Copy nginx.conf                  │
│  - Copy dist from builder           │
│  - Configure health check           │
│  - Expose port 80                   │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Docker Image │
        │  (~30-40 MB) │
        └──────────────┘
```

## Components and Interfaces

### 1. Dockerfile (Enhanced)

**Purpose**: Construir imagen Docker optimizada con multi-stage build

**Key Features**:
- Multi-stage build para minimizar tamaño
- Build arguments para configuración de entorno
- Cache optimization para dependencias
- Health check integrado
- Security best practices

**Structure**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
ARG BUILD_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:${BUILD_ENV}

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
```

### 2. Docker Compose Configuration

**Purpose**: Orquestar múltiples contenedores y configurar networking

**Files**:
- `docker-compose.yml` - Configuración base
- `docker-compose.dev.yml` - Override para desarrollo
- `docker-compose.prod.yml` - Override para producción

**Base Configuration**:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BUILD_ENV: ${ENVIRONMENT:-production}
    ports:
      - "${FRONTEND_PORT:-8080}:80"
    environment:
      - NODE_ENV=${ENVIRONMENT:-production}
    networks:
      - app-network
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  backend:
    image: aspa-backend:latest
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

networks:
  app-network:
    driver: bridge
```

### 3. Nginx Configuration (Enhanced)

**Purpose**: Servir aplicación SPA y manejar routing

**Enhancements**:
- Compression (gzip)
- Security headers
- Cache optimization
- SPA routing support
- Health check endpoint
- Optional API proxy

**Key Sections**:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        return 200 "healthy\n";
    }
}
```

### 4. Environment Configuration

**Purpose**: Gestionar configuración para diferentes entornos

**Files**:
- `.env.docker.development`
- `.env.docker.production`
- `.env.docker.staging`

**Structure**:
```bash
# .env.docker.production
VITE_API_BASE_URL=http://backend:3000
VITE_ENABLE_MOCK_MODE=false
VITE_SHOW_CONNECTION_STATUS=false
VITE_ENABLE_DEBUG=false
```

**Build-time vs Runtime**:
- Vite variables: Build-time (embedded in bundle)
- Docker variables: Runtime (container configuration)

### 5. Deployment Scripts

**Purpose**: Automatizar proceso de despliegue

**Scripts**:

#### `scripts/docker-deploy.sh`
```bash
#!/bin/bash
# Main deployment script
# - Validates environment
# - Builds images
# - Starts containers
# - Verifies deployment
```

#### `scripts/docker-build.sh`
```bash
#!/bin/bash
# Build script
# - Builds Docker image
# - Tags appropriately
# - Supports multi-environment
```

#### `scripts/docker-health-check.sh`
```bash
#!/bin/bash
# Health check script
# - Verifies frontend is running
# - Checks backend connectivity
# - Reports status
```

## Data Models

### Docker Image Metadata

```typescript
interface DockerImageMetadata {
  name: string;           // e.g., "aspa-frontend"
  tag: string;            // e.g., "latest", "v1.0.0", "dev"
  environment: 'development' | 'staging' | 'production';
  buildDate: string;
  gitCommit: string;
  size: string;           // e.g., "35MB"
}
```

### Container Configuration

```typescript
interface ContainerConfig {
  name: string;
  image: string;
  ports: PortMapping[];
  environment: Record<string, string>;
  networks: string[];
  volumes?: VolumeMapping[];
  healthCheck: HealthCheckConfig;
  restartPolicy: 'no' | 'always' | 'unless-stopped' | 'on-failure';
}

interface PortMapping {
  host: number;
  container: number;
  protocol: 'tcp' | 'udp';
}

interface HealthCheckConfig {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  startPeriod?: string;
}
```

## Error Handling

### Build Errors

**Scenario**: Build falla durante `npm run build`

**Handling**:
1. Capturar error en script de deployment
2. Mostrar logs relevantes
3. No crear imagen corrupta
4. Retornar código de error apropiado

```bash
if ! docker build -t aspa-frontend:latest .; then
    echo "❌ Build failed. Check logs above."
    exit 1
fi
```

### Container Startup Errors

**Scenario**: Contenedor no inicia correctamente

**Handling**:
1. Health check detecta fallo
2. Docker restart policy intenta reiniciar
3. Logs disponibles via `docker logs`
4. Script de deployment verifica health check

```bash
# Wait for health check
timeout 60 bash -c 'until docker inspect --format="{{.State.Health.Status}}" frontend | grep -q healthy; do sleep 2; done'
```

### Network Connectivity Errors

**Scenario**: Frontend no puede conectar con backend

**Handling**:
1. Verificar que ambos contenedores están en la misma red
2. Usar nombres de servicio DNS (no localhost)
3. Health check verifica conectividad
4. Logs muestran errores de conexión

**Solution**:
```yaml
# Ensure both services use same network
networks:
  - app-network

# Use service name in API URL
VITE_API_BASE_URL=http://backend:3000
```

### Port Conflicts

**Scenario**: Puerto 8080 ya está en uso

**Handling**:
1. Script verifica puerto antes de iniciar
2. Permite configurar puerto alternativo via variable
3. Muestra mensaje claro de error

```bash
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 8080 is already in use"
    echo "Set FRONTEND_PORT to use a different port"
    exit 1
fi
```

## Testing Strategy

### 1. Build Testing

**Objective**: Verificar que la imagen se construye correctamente

**Tests**:
- Build completa sin errores
- Tamaño de imagen < 50MB
- Todas las dependencias incluidas
- Variables de entorno correctas

**Implementation**:
```bash
# Test build
docker build -t aspa-frontend:test .

# Verify size
SIZE=$(docker images aspa-frontend:test --format "{{.Size}}")
echo "Image size: $SIZE"

# Verify files
docker run --rm aspa-frontend:test ls -la /usr/share/nginx/html
```

### 2. Container Runtime Testing

**Objective**: Verificar que el contenedor funciona correctamente

**Tests**:
- Contenedor inicia sin errores
- Health check pasa
- Puerto expuesto correctamente
- Nginx sirve archivos

**Implementation**:
```bash
# Start container
docker run -d --name test-frontend -p 8081:80 aspa-frontend:test

# Wait for health
sleep 5

# Test health endpoint
curl -f http://localhost:8081/health

# Test main page
curl -f http://localhost:8081/

# Cleanup
docker stop test-frontend
docker rm test-frontend
```

### 3. Integration Testing

**Objective**: Verificar integración con backend

**Tests**:
- Frontend puede conectar con backend
- API calls funcionan correctamente
- CORS configurado correctamente
- Authentication flow completo

**Implementation**:
```bash
# Start full stack
docker-compose up -d

# Wait for services
sleep 10

# Test API connectivity
curl -f http://localhost:8080/
curl -f http://localhost:3000/health

# Test login flow (automated)
./scripts/test-integration.sh

# Cleanup
docker-compose down
```

### 4. Environment Configuration Testing

**Objective**: Verificar que diferentes entornos funcionan

**Tests**:
- Development environment
- Production environment
- Variables de entorno correctas
- Build artifacts apropiados

**Implementation**:
```bash
# Test development
ENVIRONMENT=development docker-compose up -d
# Verify dev config
docker exec frontend cat /usr/share/nginx/html/assets/*.js | grep "VITE_ENABLE_DEBUG"

# Test production
ENVIRONMENT=production docker-compose up -d
# Verify prod config
docker exec frontend cat /usr/share/nginx/html/assets/*.js | grep "VITE_ENABLE_DEBUG"
```

### 5. Performance Testing

**Objective**: Verificar rendimiento de la aplicación

**Tests**:
- Tiempo de inicio del contenedor
- Tiempo de respuesta de nginx
- Tamaño de assets
- Compression efectiva

**Implementation**:
```bash
# Measure startup time
time docker-compose up -d

# Test response time
ab -n 100 -c 10 http://localhost:8080/

# Verify compression
curl -H "Accept-Encoding: gzip" -I http://localhost:8080/assets/index.js
```

## Security Considerations

### 1. Image Security

- Usar imágenes base oficiales y actualizadas
- Minimal base image (alpine)
- No incluir secretos en la imagen
- Scan de vulnerabilidades

### 2. Runtime Security

- Run as non-root user
- Read-only filesystem donde sea posible
- Security headers en nginx
- HTTPS en producción

### 3. Network Security

- Usar redes Docker privadas
- Exponer solo puertos necesarios
- Configurar CORS apropiadamente
- Rate limiting en nginx

## Deployment Workflow

### Development Deployment

```bash
# 1. Set environment
export ENVIRONMENT=development

# 2. Build and start
./scripts/docker-deploy.sh dev

# 3. Verify
./scripts/docker-health-check.sh

# 4. View logs
docker-compose logs -f frontend
```

### Production Deployment

```bash
# 1. Run tests
npm run validate

# 2. Build production image
./scripts/docker-build.sh production

# 3. Tag image
docker tag aspa-frontend:latest aspa-frontend:v1.0.0

# 4. Deploy
ENVIRONMENT=production ./scripts/docker-deploy.sh prod

# 5. Verify
./scripts/docker-health-check.sh

# 6. Monitor
docker stats frontend
```

## Monitoring and Logging

### Health Monitoring

- Docker health checks
- Nginx access logs
- Application error logs
- Resource usage metrics

### Log Management

```bash
# View logs
docker-compose logs frontend

# Follow logs
docker-compose logs -f frontend

# Export logs
docker logs frontend > frontend.log 2>&1
```

## Rollback Strategy

### Quick Rollback

```bash
# Stop current version
docker-compose down

# Start previous version
docker run -d --name frontend -p 8080:80 aspa-frontend:v0.9.0

# Or use docker-compose with specific tag
IMAGE_TAG=v0.9.0 docker-compose up -d
```

### Zero-Downtime Deployment

```bash
# Start new version on different port
docker run -d --name frontend-new -p 8081:80 aspa-frontend:latest

# Verify new version
curl http://localhost:8081/health

# Switch traffic (using load balancer or nginx proxy)
# Update upstream configuration

# Stop old version
docker stop frontend
docker rm frontend
```

## Documentation Structure

### 1. README.md (Frontend Docker)
- Quick start guide
- Prerequisites
- Basic commands
- Common use cases

### 2. DOCKER_DEPLOYMENT.md
- Detailed deployment guide
- Environment configuration
- Troubleshooting
- Advanced scenarios

### 3. DOCKER_ARCHITECTURE.md
- Architecture overview
- Component details
- Network topology
- Security considerations

### 4. DOCKER_TROUBLESHOOTING.md
- Common issues
- Debug procedures
- Performance tuning
- FAQ
