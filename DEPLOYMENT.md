# Linux Server Deployment Guide

## Quick Setup Commands

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd backend

# 2. Copy environment template
cp .env.example .env

# 3. Edit environment variables
nano .env  # or vim .env

# 4. Make setup script executable
chmod +x setup.sh

# 5. Run setup script
./setup.sh
```

## Manual Docker Commands

### Development Environment
```bash
# Start development with hot reload
npm run docker:dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment
```bash
# Start production (detached)
npm run docker:prod

# Or manually:
docker-compose up --build -d
```

## Environment Variables Required

Edit your `.env` file with these values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up --build

# Check container status
docker ps

# Access container shell
docker exec -it ig-obsessed-backend-dev sh
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3001
   sudo lsof -i :3001
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   # Make sure Docker daemon is running
   sudo systemctl start docker
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Then logout and login again
   ```

3. **Environment variables not loaded**
   ```bash
   # Check .env file exists and has correct values
   cat .env
   
   # Make sure no spaces around = in .env
   # Correct: SUPABASE_URL=https://...
   # Wrong:   SUPABASE_URL = https://...
   ```

4. **Build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

## Health Checks

Once running, verify the API:

```bash
# Health check
curl http://localhost:3001/health

# API documentation
curl http://localhost:3001/api-docs.json

# Test dashboard endpoint
curl http://localhost:3001/api/dashboard
```

## Accessing the Application

- **API Base URL**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## NPM Warnings

The deprecation warnings during `npm install` are normal and don't affect functionality:
- `rimraf@2.7.1`: Used by build tools
- `lodash.get@4.4.2`: Used by swagger dependencies
- `inflight@1.0.6`: Used by npm itself
- `glob@7.x.x`: Used by various build tools

These are dependency warnings and the application will work perfectly fine.

## Production Deployment

For production servers:

1. Use `docker-compose.yml` (not dev version)
2. Set `NODE_ENV=production` in .env
3. Consider using a reverse proxy (nginx)
4. Set up SSL certificates
5. Configure firewall rules
6. Set up log rotation
7. Monitor with health checks

## Docker Compose Version Compatibility

The compose files use version 3.3 for maximum compatibility with older Docker Compose versions. If you have a newer version, this will work fine.