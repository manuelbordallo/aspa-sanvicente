# Docker Deployment Guide

This guide provides detailed instructions for deploying the ASPA San Vicente Backend API using Docker.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

## Quick Start

### 1. Initial Setup

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit the environment file with your configuration
# IMPORTANT: Change JWT_SECRET, DB_PASSWORD, and email settings
nano .env
```

### 2. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs to ensure services started correctly
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Wait for PostgreSQL to be ready (check with docker-compose ps)
# Then run migrations
docker-compose exec backend npx prisma migrate deploy

# (Optional) Seed the database with sample data
docker-compose exec backend npx prisma db seed
```

### 4. Verify Deployment

- API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## Services

### Backend API

- **Container**: `aspa-backend`
- **Port**: 3000
- **Image**: Built from local Dockerfile
- **Dependencies**: PostgreSQL

### PostgreSQL Database

- **Container**: `aspa-postgres`
- **Port**: 5432
- **Image**: postgres:14-alpine
- **Volume**: `postgres_data` (persistent storage)

### pgAdmin (Optional)

- **Container**: `aspa-pgadmin`
- **Port**: 5050
- **Image**: dpage/pgadmin4:latest
- **Profile**: `tools` (not started by default)

To start with pgAdmin:
```bash
docker-compose --profile tools up -d
```

## Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Check migration status
docker-compose exec backend npx prisma migrate status

# Seed database
docker-compose exec backend npx prisma db seed

# Access PostgreSQL CLI
docker-compose exec postgres psql -U aspa_user -d aspa_db

# Backup database
docker-compose exec postgres pg_dump -U aspa_user aspa_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U aspa_user aspa_db < backup.sql
```

### Container Access

```bash
# Access backend container shell
docker-compose exec backend sh

# Access PostgreSQL container shell
docker-compose exec postgres sh

# Run commands in backend container
docker-compose exec backend npm run prisma:studio
```

### Rebuilding

```bash
# Rebuild and restart services
docker-compose up -d --build

# Rebuild a specific service
docker-compose build backend
docker-compose up -d backend
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: Deletes all data)
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | Generate with crypto |
| `DB_USER` | PostgreSQL username | `aspa_user` |
| `DB_PASSWORD` | PostgreSQL password | Strong password |
| `DB_NAME` | Database name | `aspa_db` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email password | App password |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use a secure `DB_PASSWORD`
- [ ] Configure proper `CORS_ORIGIN` for your domain
- [ ] Set up SSL/TLS certificates (use reverse proxy like nginx)
- [ ] Enable firewall rules
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Use Docker secrets for sensitive data (advanced)

### Recommended Production Setup

1. **Use a reverse proxy** (nginx or Traefik) for SSL termination
2. **Set up automated backups**:
```bash
# Add to crontab
0 2 * * * docker-compose exec postgres pg_dump -U aspa_user aspa_db > /backups/aspa_$(date +\%Y\%m\%d).sql
```

3. **Monitor logs**:
```bash
# Set up log rotation
docker-compose logs --tail=1000 backend > /var/log/aspa-backend.log
```

4. **Health monitoring**:
```bash
# Use the health endpoint
curl http://localhost:3000/health
```

## Troubleshooting

### Backend won't start

**Symptom**: Backend container exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for postgres to be healthy
docker-compose ps

# 2. Migrations not applied
docker-compose exec backend npx prisma migrate deploy

# 3. Environment variables missing
docker-compose config
```

### Database connection errors

**Symptom**: "Can't reach database server"

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection from backend
docker-compose exec backend sh -c 'nc -zv postgres 5432'
```

### Port already in use

**Symptom**: "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution**:
```bash
# Find process using the port
lsof -i :3000

# Kill the process or change PORT in .env
PORT=3001 docker-compose up -d
```

### Out of disk space

**Symptom**: Various errors related to disk space

**Solution**:
```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove old volumes (WARNING: May delete data)
docker volume prune
```

### Migrations fail

**Symptom**: Migration errors during startup

**Solution**:
```bash
# Check migration status
docker-compose exec backend npx prisma migrate status

# Reset database (WARNING: Deletes all data)
docker-compose exec backend npx prisma migrate reset

# Or manually apply migrations
docker-compose exec backend npx prisma migrate deploy
```

## Performance Tuning

### Database Connection Pool

Adjust in `.env`:
```env
DB_POOL_MAX=20
DB_POOL_MIN=5
```

### Container Resources

Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### PostgreSQL Performance

Add to `docker-compose.yml`:
```yaml
services:
  postgres:
    command: postgres -c shared_buffers=256MB -c max_connections=200
```

## Monitoring

### Health Checks

The backend includes a health check endpoint:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

### Container Health

```bash
# Check container health status
docker-compose ps

# View health check logs
docker inspect aspa-backend | grep -A 10 Health
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00 backend
```

## Backup and Restore

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U aspa_user aspa_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker-compose exec postgres pg_dump -U aspa_user aspa_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker-compose exec -T postgres psql -U aspa_user aspa_db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | docker-compose exec -T postgres psql -U aspa_user aspa_db
```

### Volume Backup

```bash
# Backup volume data
docker run --rm -v aspa-backend_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz -C /data .

# Restore volume data
docker run --rm -v aspa-backend_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_backup.tar.gz -C /data
```

## Advanced Configuration

### Using Docker Secrets

For enhanced security in production:

1. Create secrets:
```bash
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -
```

2. Update `docker-compose.yml`:
```yaml
services:
  backend:
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

### Multi-Stage Environments

Create separate compose files:
- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production overrides

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check the main README.md
4. Consult the API documentation at `/api/docs`
