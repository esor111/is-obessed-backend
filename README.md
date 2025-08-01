# IG Obsessed Backend API

Backend API for the IG Obsessed topic tracking application with earnings management.

## Features

- **Topic Management**: Create, read, update topics with categories and earnings tracking
- **Subtopic Management**: Manage subtopics with repetition tracking and goal amounts
- **Dashboard Analytics**: Global goals, earnings calculation, and progress tracking
- **Categories**: Dynamic category management based on existing topics
- **Swagger Documentation**: Interactive API documentation with testing capabilities

## Quick Start

### Prerequisites

- Node.js (v16 or higher) OR Docker
- npm or yarn (if running locally)
- Supabase account and project

### Option 1: Local Development

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=3001
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Option 2: Docker Development

1. Configure environment variables in `.env`:
   ```env
   PORT=3001
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Start with Docker Compose (development):
   ```bash
   npm run docker:dev
   ```

### Option 3: Docker Production

1. Build and run production container:
   ```bash
   npm run docker:prod
   ```

2. View logs:
   ```bash
   npm run docker:logs
   ```

3. Stop containers:
   ```bash
   npm run docker:stop
   ```

### API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:3001/api-docs
- **API JSON**: http://localhost:3001/api-docs.json
- **Health Check**: http://localhost:3001/health

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard overview data
- `PUT /api/dashboard/global-goal` - Update global earnings goal

### Topics
- `GET /api/topics/:topicId` - Get specific topic with subtopics
- `POST /api/topics` - Create new topic
- `PUT /api/topics/:topicId` - Update existing topic

### Subtopics
- `GET /api/sub-topics/:subtopicId` - Get specific subtopic
- `POST /api/topics/:topicId/sub-topics` - Create subtopic within topic
- `PUT /api/sub-topics/:subtopicId` - Update existing subtopic
- `POST /api/sub-topics/:subtopicId/reps` - Add/subtract repetitions

### Categories
- `GET /api/categories` - Get all unique categories

## Key Features

### Calculation Logic

- **Topic Earnings**: `Math.floor(totalRepsFromAllSubtopics / 5) * moneyPer5Reps`
- **Topic Completion**: `(totalRepsCompleted / totalRepsGoal) * 100`
- **Dashboard Progress**: `(currentEarnings / globalGoal) * 100`

### Business Rules

- Subtopics always have `repsGoal: 18`
- Goal amounts must be multiples of ₹1000
- Milestone earnings are calculated in ₹1000 blocks
- The reps endpoint returns both updated subtopic and parent topic

## Development

### Scripts

#### Local Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

#### Docker Commands
- `npm run docker:build` - Build production Docker image
- `npm run docker:run` - Run production container
- `npm run docker:dev` - Start development environment with Docker
- `npm run docker:prod` - Start production environment with Docker
- `npm run docker:stop` - Stop all containers
- `npm run docker:logs` - View container logs

### Project Structure

```
src/
├── config/          # Configuration files (Swagger)
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic and database services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and calculations
└── server.ts        # Main server file
```

## Database Schema

The API uses Supabase PostgreSQL with the following tables:

- `topics` - Main topics with earnings tracking
- `subtopics` - Related subtopics with reps tracking
- `global_settings` - Configuration settings

## Testing the API

Use the Swagger UI at http://localhost:3001/api-docs to:

1. View all available endpoints
2. Test API calls directly from the browser
3. See request/response schemas
4. Try different scenarios with sample data

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:3000) | No |

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success (GET/PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Support

For issues and questions, please check the Swagger documentation first at http://localhost:3001/api-docs#   i s - o b e s s e d - b a c k e n d 
 
 ## D
ocker Deployment

### Docker Files Overview

- `Dockerfile` - Production-ready multi-stage build
- `Dockerfile.dev` - Development environment with hot reload
- `docker-compose.yml` - Production deployment configuration
- `docker-compose.dev.yml` - Development environment setup
- `.dockerignore` - Files to exclude from Docker build context
- `healthcheck.js` - Health check script for container monitoring

### Docker Commands

```bash
# Development with hot reload
npm run docker:dev

# Production deployment
npm run docker:prod

# Build production image manually
npm run docker:build

# Run production container manually
npm run docker:run

# View container logs
npm run docker:logs

# Stop all containers
npm run docker:stop
```

### Docker Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Container Health Monitoring

The Docker containers include health checks that monitor:
- HTTP endpoint availability (`/health`)
- Response time (< 3 seconds)
- Container restart on failure

### Production Deployment

For production deployment, the Docker setup includes:
- Multi-stage build for optimized image size
- Non-root user for security
- Health checks for monitoring
- Graceful shutdown handling
- Network isolation

## Quick Docker Start

```bash
# Clone and setup
git clone <repository>
cd backend

# Create environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development environment
npm run docker:dev

# Or start production environment
npm run docker:prod
```

The API will be available at http://localhost:3001 with Swagger documentation at http://localhost:3001/api-docs