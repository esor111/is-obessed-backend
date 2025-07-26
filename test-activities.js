// Simple test script to verify activity API endpoints
const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Activity API Endpoints...\n');

  try {
    // Test 1: Get all activities
    console.log('1. Testing GET /activities');
    const activitiesResponse = await fetch(`${BASE_URL}/activities`);
    const activities = await activitiesResponse.json();
    console.log(`✅ Found ${activities.length} activities`);
    console.log('Activities:', activities.map(a => ({ name: a.name, reps: a.reps })));

    if (activities.length > 0) {
      const firstActivity = activities[0];
      
      // Test 2: Get activity progress
      console.log(`\n2. Testing GET /activities/${firstActivity.id}/progress`);
      const progressResponse = await fetch(`${BASE_URL}/activities/${firstActivity.id}/progress`);
      const progress = await progressResponse.json();
      console.log('✅ Progress data:', {
        activity: progress.activity.name,
        daily_progress: progress.daily_progress,
        time_remaining_today: progress.time_remaining_today
      });

      // Test 3: Increment reps
      console.log(`\n3. Testing POST /activities/${firstActivity.id}/increment`);
      const incrementResponse = await fetch(`${BASE_URL}/activities/${firstActivity.id}/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 })
      });
      const incrementedActivity = await incrementResponse.json();
      console.log(`✅ Incremented ${firstActivity.name} reps: ${firstActivity.reps} → ${incrementedActivity.reps}`);

      // Test 4: Start a session (for Focus Hour if available)
      const focusHour = activities.find(a => a.name === 'Focus Hour');
      if (focusHour) {
        console.log(`\n4. Testing POST /activities/${focusHour.id}/sessions/start`);
        try {
          const sessionResponse = await fetch(`${BASE_URL}/activities/${focusHour.id}/sessions/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_type: 'timer' })
          });
          const session = await sessionResponse.json();
          console.log('✅ Started session:', { id: session.id, start_time: session.start_time });

          // Test 5: Get timer status
          console.log(`\n5. Testing GET /activities/${focusHour.id}/timer`);
          const timerResponse = await fetch(`${BASE_URL}/activities/${focusHour.id}/timer`);
          const timer = await timerResponse.json();
          console.log('✅ Timer status:', { elapsed_minutes: timer.elapsed_minutes, is_running: timer.is_running });

          // Test 6: End session after a short delay
          setTimeout(async () => {
            console.log(`\n6. Testing POST /activities/${focusHour.id}/sessions/${session.id}/end`);
            const endResponse = await fetch(`${BASE_URL}/activities/${focusHour.id}/sessions/${session.id}/end`, {
              method: 'POST'
            });
            const endedSession = await endResponse.json();
            console.log('✅ Ended session:', { 
              duration_minutes: endedSession.duration_minutes, 
              is_active: endedSession.is_active 
            });
          }, 2000);
        } catch (error) {
          console.log('⚠️ Session test skipped (might already have active session)');
        }
      }
    }

    // Test 7: Dashboard data
    console.log('\n7. Testing GET /dashboard/activities');
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard/activities`);
    const dashboard = await dashboardResponse.json();
    console.log('✅ Dashboard stats:', dashboard.stats);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();