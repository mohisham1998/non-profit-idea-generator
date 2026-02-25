# Docker Deployment Guide

This guide will help you deploy the Nonprofit Ideas Generator using Docker.

## Quick Start

### 1. Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

Check your versions:
```bash
docker --version
docker-compose --version
```

### 2. Initial Setup

1. **Clone and navigate to the project:**
   ```bash
   cd nonprofit-ideas-generator
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual credentials
   # IMPORTANT: Change these values in production!
   ```

3. **Update critical environment variables in `.env`:**
   ```bash
   # Generate a secure JWT secret
   JWT_SECRET=$(openssl rand -base64 32)
   
   # Add your Manus credentials
   VITE_APP_ID=your-app-id-from-manus
   BUILT_IN_FORGE_API_KEY=your-forge-api-key
   OWNER_OPEN_ID=your-owner-open-id
   ```

### 3. Start the Application

```bash
# Start all services (PostgreSQL + Application)
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize the Database

```bash
# Run database migrations
docker-compose exec app pnpm run db:push

# Verify database is ready
docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas -c "\dt"
```

### 5. Access the Application

- **Application URL:** http://localhost:3000
- **PostgreSQL:** localhost:5432

Default PostgreSQL credentials (change in production):
- User: `nonprofit_user`
- Password: `nonprofit_password_change_me`
- Database: `nonprofit_ideas`

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change PostgreSQL password in `docker-compose.yml`
- [ ] Generate strong JWT_SECRET
- [ ] Use HTTPS/SSL
- [ ] Set up proper firewall rules
- [ ] Configure backup strategy
- [ ] Set resource limits in docker-compose.yml
- [ ] Use Docker secrets for sensitive data
- [ ] Enable PostgreSQL authentication
- [ ] Configure log rotation
- [ ] Set up monitoring

### Production Configuration

1. **Update `docker-compose.yml` for production:**

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # Use secrets!
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  app:
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: always
```

2. **Use Docker secrets (recommended):**

```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  forge_api_key:
    file: ./secrets/forge_api_key.txt

services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password

  app:
    secrets:
      - jwt_secret
      - forge_api_key
```

### SSL/TLS Setup

To enable HTTPS, use a reverse proxy like Nginx:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

## Management Commands

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas

# Create backup
docker-compose exec postgres pg_dump -U nonprofit_user nonprofit_ideas > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U nonprofit_user -d nonprofit_ideas < backup.sql

# Reset database (⚠️ DESTRUCTIVE!)
docker-compose exec postgres psql -U postgres -c "DROP DATABASE nonprofit_ideas;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE nonprofit_ideas OWNER nonprofit_user;"
docker-compose exec app pnpm run db:push
```

### Application Management

```bash
# Restart application
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app

# Access application shell
docker-compose exec app sh

# Run migrations
docker-compose exec app pnpm run db:push

# Run tests
docker-compose exec app pnpm run test
```

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose build --no-cache

# Restart with new version
docker-compose down
docker-compose up -d

# Run any new migrations
docker-compose exec app pnpm run db:push
```

## Backup Strategy

### Automated Backups

Create a backup script (`scripts/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="nonprofit-postgres"

# Create backup
docker exec $CONTAINER pg_dump -U nonprofit_user nonprofit_ideas | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh
```

## Monitoring

### Health Checks

The application includes health check endpoints:

```bash
# Application health
curl http://localhost:3000/health

# Database health (from container)
docker-compose exec app pnpm run check
```

### Resource Monitoring

```bash
# View resource usage
docker stats

# Specific container stats
docker stats nonprofit-app nonprofit-postgres
```

## Troubleshooting

### Application won't start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep DATABASE_URL
   ```

3. Check if PostgreSQL is ready:
   ```bash
   docker-compose exec postgres pg_isready -U nonprofit_user
   ```

### Database connection issues

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check network connectivity:
   ```bash
   docker-compose exec app ping postgres
   ```

3. Test database connection:
   ```bash
   docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas -c "SELECT 1;"
   ```

### Port already in use

```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### Out of disk space

```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove specific unused volumes
docker volume prune
```

### Permission issues

```bash
# Fix ownership of volumes (Linux)
sudo chown -R $USER:$USER postgres_data/

# Or recreate volume
docker-compose down -v
docker-compose up -d
```

## Performance Tuning

### PostgreSQL Optimization

Add to `docker-compose.yml`:

```yaml
services:
  postgres:
    command: 
      - "postgres"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "effective_cache_size=1GB"
```

### Application Optimization

```yaml
services:
  app:
    environment:
      NODE_OPTIONS: "--max-old-space-size=2048"
```

## Scaling

### Horizontal Scaling

To run multiple application instances behind a load balancer:

```yaml
services:
  app:
    deploy:
      replicas: 3
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### Database Read Replicas

For high-traffic applications, consider PostgreSQL read replicas or connection pooling with PgBouncer.

## Maintenance

### Regular Tasks

- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check disk space
- [ ] Monthly: Update Docker images
- [ ] Monthly: Review and rotate logs
- [ ] Quarterly: Review and update dependencies
- [ ] Quarterly: Test backup restoration

### Update Checklist

Before any update:
- [ ] Create database backup
- [ ] Test in staging environment
- [ ] Review changelog
- [ ] Plan rollback strategy
- [ ] Schedule maintenance window
- [ ] Notify users

## Support

For issues:
1. Check this guide
2. Review application logs
3. Check GitHub issues
4. Contact your system administrator

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
