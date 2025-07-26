# Frontend Integration Guide - Activity Tracking Backend

## 🎯 Backend Implementation Complete!

Your activity tracking backend is now fully implemented and ready for frontend integration. Here's everything your frontend team needs to know:

## 🚀 Server Details

- **Base URL**: `http://localhost:7001/api`
- **Health Check**: `http://localhost:7001/health`
- **API Documentation**: `http://localhost:7001/api-docs`

## 📊 Database Structure

### Activities Table

- **4 Pre-loaded Activities**: Focus Hour, Push-ups, Reading, Meditation
- **Real-time Rep Tracking**: Current count with increment/decrement
- **Goal System**: Daily, weekly, monthly, yearly targets
- **Time Tracking**: Special handling for Focus Hour (1 rep = 1 minute)

### Sessions Table

- **Timer Functionality**: Start/stop sessions with duration tracking
- **Automatic Rep Updates**: Focus Hour sessions auto-increment reps by minutes

## 🔗 Key API Endpoints for Frontend

### 1. Activity Management

```javascript
// Get all activities
GET /api/activities
// Response: Array of activities with current reps and goals

// Get specific activity
GET /api/activities/:id

// Increment reps (for + button)
POST /api/activities/:id/increment
Body: { "amount": 1 }

// Decrement reps (for - button)
POST /api/activities/:id/decrement
Body: { "amount": 1 }
```

### 2. Progress Tracking

```javascript
// Get comprehensive progress data
GET /api/activities/:id/progress
// Response includes:
// - daily_progress: { current, target, percentage, remaining }
// - weekly_progress: { current, target, percentage, remaining }
// - monthly_progress: { current, target, percentage, remaining }
// - yearly_progress: { current, target, percentage, remaining }
// - time_remaining_today: minutes until end of day
```

### 3. Timer Controls

```javascript
// Start timer session
POST /api/activities/:id/sessions/start
Body: { "session_type": "timer" }

// End timer session (auto-increments Focus Hour reps)
POST /api/activities/:id/sessions/:sessionId/end

// Get current timer status
GET /api/activities/:id/timer
// Response: { session, elapsed_minutes, is_running }
```

### 4. Dashboard Data

```javascript
// Get comprehensive dashboard
GET / api / dashboard / activities;
// Response includes:
// - stats: { total_activities, total_reps_today, active_sessions, completion_rate }
// - activities: Array of all activities
// - progress: Array of progress data for each activity

// Get simplified summary
GET / api / dashboard / activities / summary;
// Response: Array with { id, name, current_reps, daily_goal, progress_percentage }
```

## 🎨 Frontend Implementation Recommendations

### Activity List Component

```javascript
// Fetch activities on component mount
const [activities, setActivities] = useState([]);

useEffect(() => {
  fetch("http://localhost:7001/api/activities")
    .then((res) => res.json())
    .then(setActivities);
}, []);

// Increment function for + button
const incrementReps = async (activityId) => {
  const response = await fetch(
    `http://localhost:7001/api/activities/${activityId}/increment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1 }),
    }
  );
  const updatedActivity = await response.json();
  // Update state with new rep count
};
```

### Timer Component (for Focus Hour)

```javascript
const [timerStatus, setTimerStatus] = useState(null);
const [isRunning, setIsRunning] = useState(false);

// Start timer
const startTimer = async (activityId) => {
  const response = await fetch(
    `http://localhost:7001/api/activities/${activityId}/sessions/start`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_type: "timer" }),
    }
  );
  const session = await response.json();
  setIsRunning(true);
  // Start interval to update elapsed time
};

// End timer
const endTimer = async (activityId, sessionId) => {
  await fetch(
    `http://localhost:7001/api/activities/${activityId}/sessions/${sessionId}/end`,
    {
      method: "POST",
    }
  );
  setIsRunning(false);
  // Refresh activity data to show updated reps
};
```

### Progress Display Component

```javascript
const [progress, setProgress] = useState(null);

useEffect(() => {
  fetch(`http://localhost:7001/api/activities/${activityId}/progress`)
    .then((res) => res.json())
    .then(setProgress);
}, [activityId]);

// Display progress bars, percentages, remaining targets
// Show time remaining in current day for deadline alerts
```

## ✅ Features Implemented

### ✅ Core Requirements

- [x] Activity list with names and rep counts
- [x] Increment (+) and decrement (-) buttons
- [x] Real-time rep count updates
- [x] Negative rep count prevention
- [x] Goal tracking (daily/weekly/monthly/yearly)

### ✅ Time Tracking

- [x] Focus Hour: 1 rep = 1 minute
- [x] Timer controls with visual countdown
- [x] Progress tracking with duration counter
- [x] Session completion tracking
- [x] Time remaining display

### ✅ Data Visualization Ready

- [x] Daily/weekly progress data available
- [x] Completion rate calculations
- [x] Time spent per activity tracking
- [x] Dashboard statistics

### ✅ Goal Tracking Features

- [x] Time remaining in current day calculation
- [x] Progress towards daily targets
- [x] Visual progress data for countdown displays
- [x] Alert-ready data for approaching deadlines

## 🧪 Testing

The backend has been tested and verified:

- ✅ All activities load correctly
- ✅ Increment/decrement functions work
- ✅ Progress calculations are accurate
- ✅ Timer functionality operational
- ✅ Dashboard data aggregation working

## 🔄 Next Steps for Frontend

1. **Create Activity List**: Display activities with current reps and +/- buttons
2. **Implement Timer UI**: Focus Hour timer with start/stop controls
3. **Add Progress Bars**: Visual representation of goal progress
4. **Build Dashboard**: Overview with stats and completion rates
5. **Add Real-time Updates**: Consider WebSocket or polling for live updates

## 📝 Sample Data Available

The system comes with 4 pre-loaded activities:

- **Focus Hour**: 60-minute daily goal (time-based)
- **Push-ups**: 50 daily goal (count-based)
- **Reading**: 30-minute daily goal (count-based)
- **Meditation**: 20-minute daily goal (count-based)

## 🛠️ Development Notes

- All endpoints return proper HTTP status codes
- Error handling implemented for invalid requests
- CORS configured for frontend development
- Swagger documentation available at `/api-docs`
- Database automatically handles timestamps and calculations

Your backend is production-ready and waiting for the frontend magic! 🎉
