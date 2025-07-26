# Activity Tracking Backend - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase project configured
- Environment variables set

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials:
```env
PORT=7001
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
FRONTEND_URL=http://localhost:3000
```

### Installation & Running
```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Docker development
npm run docker:dev

# Docker production
npm run docker:prod
```

## 📊 Database Schema

### Tables Created
- `activities` - Main activity tracking table
- `activity_sessions` - Timer session tracking
- Database functions for safe rep incrementing
- Triggers for automatic timestamp updates

### Sample Data
- 4 pre-loaded activities with realistic goals
- Ready for immediate frontend testing

## 🔗 API Endpoints Summary

### Core Activity Management
- `GET /api/activities` - List all activities
- `POST /api/activities/:id/increment` - Increment reps
- `POST /api/activities/:id/decrement` - Decrement reps
- `GET /api/activities/:id/progress` - Get progress data

### Timer & Sessions
- `POST /api/activities/:id/sessions/start` - Start timer
- `POST /api/activities/:id/sessions/:sessionId/end` - End timer
- `GET /api/activities/:id/timer` - Get timer status

### Dashboard
- `GET /api/dashboard/activities` - Complete dashboard data
- `GET /api/dashboard/activities/summary` - Simplified summary

## 🧪 Testing

### Health Check
```bash
curl http://localhost:7001/health
```

### Test Activities API
```bash
# Get all activities
curl http://localhost:7001/api/activities

# Increment reps
curl -X POST http://localhost:7001/api/activities/{id}/increment \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}'
```

### Run Test Script
```bash
node test-activities.js
```

## 📚 Documentation

- **API Docs**: http://localhost:7001/api-docs
- **Swagger JSON**: http://localhost:7001/api-docs.json
- **Integration Guide**: See `FRONTEND_INTEGRATION_GUIDE.md`
- **API Reference**: See `ACTIVITY_API.md`

## 🔧 Configuration

### CORS
- Configured for frontend development
- Default: `http://localhost:3000`
- Update `FRONTEND_URL` in `.env` for production

### Database
- Supabase PostgreSQL
- Automatic migrations applied
- Row Level Security can be enabled if needed

### Logging
- Request logging enabled in development
- Error handling with proper HTTP status codes
- Graceful shutdown handling

## 🐳 Docker Support

### Development
```bash
npm run docker:dev
```

### Production
```bash
npm run docker:prod
```

## 📈 Performance

### Database Optimizations
- Indexes on frequently queried columns
- Efficient JSONB queries for goals
- Database functions for atomic operations

### API Optimizations
- Minimal data transfer
- Proper HTTP caching headers
- Error handling without sensitive data exposure

## 🔒 Security

### Environment Variables
- All sensitive data in environment variables
- No hardcoded credentials
- Separate development/production configs

### API Security
- Input validation on all endpoints
- SQL injection prevention via Supabase client
- CORS properly configured

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=7001
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-anon-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Process Management
- Use PM2 or similar for process management
- Enable logging and monitoring
- Set up health check endpoints

### Monitoring
- Health check: `/health`
- API documentation: `/api-docs`
- Monitor database connections and query performance

## 🎯 Ready for Frontend Integration!

Your backend is fully implemented with:
- ✅ Complete activity tracking system
- ✅ Timer functionality for Focus Hour
- ✅ Goal tracking and progress calculations
- ✅ Dashboard data aggregation
- ✅ Comprehensive API documentation
- ✅ Production-ready deployment setup

The frontend team can now start building the UI components using the provided API endpoints!