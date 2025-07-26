import { ActivityService } from "./activityService";
import { Activity, ActivityProgress } from "../types/activity";

export interface DashboardStats {
  total_activities: number;
  total_reps_today: number;
  active_sessions: number;
  completion_rate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  activities: Activity[];
  progress: ActivityProgress[];
  recent_sessions: any[];
}

export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    try {
      // Get all activities
      const activities = await ActivityService.getAllActivities();
      
      // Get progress for each activity
      const progressPromises = activities.map(activity => 
        ActivityService.getActivityProgress(activity.id)
      );
      const progressResults = await Promise.all(progressPromises);
      const progress = progressResults.filter(p => p !== null) as ActivityProgress[];

      // Calculate dashboard stats
      const totalRepsToday = activities.reduce((sum, activity) => sum + activity.reps, 0);
      const totalDailyGoals = progress.reduce((sum, p) => sum + p.daily_progress.target, 0);
      const completionRate = totalDailyGoals > 0 ? (totalRepsToday / totalDailyGoals) * 100 : 0;

      // Count active sessions
      const activeSessionsPromises = activities.map(activity => 
        ActivityService.getActiveSession(activity.id)
      );
      const activeSessions = await Promise.all(activeSessionsPromises);
      const activeSessionCount = activeSessions.filter(session => session !== null).length;

      const stats: DashboardStats = {
        total_activities: activities.length,
        total_reps_today: totalRepsToday,
        active_sessions: activeSessionCount,
        completion_rate: Math.round(completionRate * 100) / 100
      };

      return {
        stats,
        activities,
        progress,
        recent_sessions: [] // Can be implemented later if needed
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
  }

  static async getActivitySummary() {
    const activities = await ActivityService.getAllActivities();
    
    return activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      current_reps: activity.reps,
      daily_goal: activity.goals.daily,
      progress_percentage: activity.goals.daily > 0 
        ? Math.round((activity.reps / activity.goals.daily) * 100) 
        : 0
    }));
  }
}