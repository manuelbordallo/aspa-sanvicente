# Docker Deployment Troubleshooting

## Quick Fix - Application Not Loading

If the application doesn't load at http://localhost:8080, follow these steps:

### 1. Rebuild the Docker Image

The most common issue is that the Docker image was built before the application was compiled. Rebuild with:

```bash
# Stop and remove containers
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# Start the container
docker-compose up -d
```

### 2. Check Container Status

```bash
# Check if container is running
docker-compose ps

# Should show status as "Up" and "healthy"
```

### 3. Check Container Logs

```bash
# View logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app
```

### 4. Verify Files Inside Container

```bash
# Check if files exist in container
docker exec aspa-sanvicente-app-1 ls -la /usr/share/nginx/html/

# Should show index.html and assets folder
```

### 5. Test Nginx Configuration

```bash
# Test nginx config
docker exec aspa-sanvicente-app-1 nginx -t

# Should show "syntax is ok" and "test is successful"
```

## Common Issues

### Issue: Container is "unhealthy"

**Cause**: Health check is failing

**Solution**:

```bash
# Check health check logs
docker inspect aspa-sanvicente-app-1 | grep -A 10 Health

# Wait 30 seconds for health check to pass
sleep 30 && docker-compose ps
```

### Issue: Port 8080 already in use

**Cause**: Another service is using port 8080

**Solution**:

```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process or change port in docker-compose.yml
# Change "8080:80" to "8081:80" for example
```

### Issue: "Cannot connect to Docker daemon"

**Cause**: Docker is not running

**Solution**:

```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Issue: Build fails with "npm ci" error

**Cause**: package-lock.json is out of sync

**Solution**:

```bash
# Regenerate package-lock.json locally
rm package-lock.json
npm install

# Then rebuild Docker
docker-compose build --no-cache
```

### Issue: Application loads but shows blank page

**Cause**: JavaScript errors or missing environment variables

**Solution**:

1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify environment variables in `.env.production`
4. Rebuild with correct environment:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Issue: Assets not loading (404 errors)

**Cause**: Nginx configuration or base path issue

**Solution**:

```bash
# Check nginx config
docker exec aspa-sanvicente-app-1 cat /etc/nginx/conf.d/default.conf

# Verify assets exist
docker exec aspa-sanvicente-app-1 ls -la /usr/share/nginx/html/assets/
```

## Useful Commands

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View running containers
docker-compose ps

# View all containers (including stopped)
docker ps -a
```

### Logs and Debugging

```bash
# View logs
docker-compose logs app

# Follow logs
docker-compose logs -f app

# Last 50 lines
docker-compose logs --tail 50 app

# Execute command in container
docker exec -it aspa-sanvicente-app-1 sh

# Inside container, you can:
# - ls /usr/share/nginx/html/
# - cat /etc/nginx/conf.d/default.conf
# - wget http://localhost/
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi aspa-sanvicente-app

# Remove all unused images
docker image prune -a

# Build without cache
docker-compose build --no-cache
```

### Clean Up

```bash
# Stop and remove containers, networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove everything (containers, images, volumes)
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
```

## Testing the Deployment

### 1. Check if server responds

```bash
curl -I http://localhost:8080
# Should return: HTTP/1.1 200 OK
```

### 2. Check if HTML is served

```bash
curl http://localhost:8080 | head -20
# Should show HTML content
```

### 3. Check if assets load

```bash
curl -I http://localhost:8080/assets/main-[hash].js
# Should return: HTTP/1.1 200 OK
```

### 4. Access in browser

Open http://localhost:8080 in your browser and:

- Check browser console (F12) for errors
- Check Network tab for failed requests
- Verify application loads correctly

## Performance Optimization

### Check Container Resources

```bash
# View container stats
docker stats aspa-sanvicente-app-1

# Should show low CPU and memory usage
```

### Optimize Image Size

```bash
# Check image size
docker images aspa-sanvicente-app

# Current size should be ~50-100MB
```

## Production Deployment

For production deployment with Docker:

1. **Use environment variables**:

   ```yaml
   # docker-compose.yml
   environment:
     - VITE_API_BASE_URL=https://api.production.com
   ```

2. **Use Docker secrets** for sensitive data

3. **Set up reverse proxy** (Traefik, Nginx Proxy Manager)

4. **Enable HTTPS** with Let's Encrypt

5. **Set up monitoring** (Prometheus, Grafana)

6. **Configure logging** (ELK stack, Loki)

## Health Check

The container includes a health check that runs every 30 seconds:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

Check health status:

```bash
docker inspect aspa-sanvicente-app-1 --format='{{.State.Health.Status}}'
# Should return: healthy
```

## Support

If you continue to have issues:

1. Check Docker logs: `docker-compose logs app`
2. Verify local build works: `npm run build && npm run preview`
3. Check Docker version: `docker --version` (should be 20.10+)
4. Check Docker Compose version: `docker-compose --version` (should be 2.0+)
5. Restart Docker Desktop/daemon

## Quick Reference

```bash
# Complete rebuild and restart
docker-compose down && \
docker-compose build --no-cache && \
docker-compose up -d && \
docker-compose logs -f app

# Check everything is working
docker-compose ps && \
curl -I http://localhost:8080 && \
echo "✅ Application should be running at http://localhost:8080"
```
