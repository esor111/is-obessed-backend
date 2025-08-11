import { supabase } from "../config/supabase";
import {
  Activity,
  ActivitySession,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityProgress,
  StartSessionRequest,
  TimerStatus,
} from "../types/activity";
import ChallengeService from "./challengeService";

export class ActivityService {
  // Get all activities
  static async getAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return data || [];
  }

  // Get activity by ID
  static async getActivityById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }

    return data;
  }

  // Create new activity
  static async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert([{
        name: activityData.name,
        goals: activityData.goals || {
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0
        }
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }

    return data;
  }

  // Update activity
  static async updateActivity(id: string, updates: UpdateActivityRequest): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    return data;
  }

  // Delete activity
  static async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
  }

  // Increment activity reps
  static async incrementReps(id: string, amount: number = 1): Promise<Activity> {
    const { data, error } = await supabase.rpc('increment_activity_reps', {
      activity_id: id,
      increment_amount: amount
    });

    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const activity = await this.getActivityById(id);
      if (!activity) {
        throw new Error("Activity not found");
      }

      return await this.updateActivity(id, {
        reps: Math.max(0, activity.reps + amount)
      });
    }

    return data;
  }

  // Decrement activity reps
  static async decrementReps(id: string, amount: number = 1): Promise<Activity> {
    const activity = await this.getActivityById(id);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const newReps = Math.max(0, activity.reps - amount);
    return await this.updateActivity(id, { reps: newReps });
  }

  // Get activity progress with time calculations
  static async getActivityProgress(id: string): Promise<ActivityProgress | null> {
    const activity = await this.getActivityById(id);
    if (!activity) return null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Calculate current progress for different periods
    const dailyProgress = {
      current: activity.reps,
      target: activity.goals.daily,
      percentage: activity.goals.daily > 0 ? (activity.reps / activity.goals.daily) * 100 : 0,
      remaining: Math.max(0, activity.goals.daily - activity.reps)
    };

    const weeklyProgress = {
      current: activity.reps,
      target: activity.goals.weekly,
      percentage: activity.goals.weekly > 0 ? (activity.reps / activity.goals.weekly) * 100 : 0,
      remaining: Math.max(0, activity.goals.weekly - activity.reps)
    };

    const monthlyProgress = {
      current: activity.reps,
      target: activity.goals.monthly,
      percentage: activity.goals.monthly > 0 ? (activity.reps / activity.goals.monthly) * 100 : 0,
      remaining: Math.max(0, activity.goals.monthly - activity.reps)
    };

    const yearlyProgress = {
      current: activity.reps,
      target: activity.goals.yearly,
      percentage: activity.goals.yearly > 0 ? (activity.reps / activity.goals.yearly) * 100 : 0,
      remaining: Math.max(0, activity.goals.yearly - activity.reps)
    };

    // Calculate time remaining in current day (in minutes)
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const timeRemainingToday = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60)));

    return {
      activity,
      daily_progress: dailyProgress,
      weekly_progress: weeklyProgress,
      monthly_progress: monthlyProgress,
      yearly_progress: yearlyProgress,
      time_remaining_today: timeRemainingToday
    };
  }

  // Start a new activity session
  static async startSession(sessionData: StartSessionRequest): Promise<ActivitySession> {
    // Check if there's already an active session for this activity
    const { data: existingSession } = await supabase
      .from("activity_sessions")
      .select("*")
      .eq("activity_id", sessionData.activity_id)
      .eq("is_active", true)
      .single();

    if (existingSession) {
      throw new Error("Activity already has an active session");
    }

    const { data, error } = await supabase
      .from("activity_sessions")
      .insert([{
        activity_id: sessionData.activity_id,
        session_type: sessionData.session_type || 'manual'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start session: ${error.message}`);
    }

    return data;
  }

  // End an activity session
  static async endSession(sessionId: string): Promise<ActivitySession> {
    try {
      // First get the session to calculate duration
      const { data: sessionData, error: fetchError } = await supabase
        .from("activity_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("is_active", true)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch active session: ${fetchError.message}`);
      }

      const now = new Date();
      const startTime = new Date(sessionData.start_time);
      const durationMinutes = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60)));

      // Update session with end time and duration
      const { data, error } = await supabase
        .from("activity_sessions")
        .update({
          end_time: now.toISOString(),
          duration_minutes: durationMinutes,
          is_active: false
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to end session: ${error.message}`);
      }

      // For Focus Hour activity, increment reps by duration in minutes
      if (durationMinutes > 0) {
        const { data: activity } = await supabase
          .from("activities")
          .select("name")
          .eq("id", data.activity_id)
          .single();

        if (activity?.name === "Focus Hour" || activity?.name === "FOCUSSED TIME") {
          try {
            await this.incrementReps(data.activity_id, Math.floor(durationMinutes));
            
            // Update challenge progress with focus hours
            await ChallengeService.updateDailyFocusHours(durationMinutes);
            
            console.log(`Focus session completed: ${durationMinutes} minutes added to challenge`);
          } catch (repError) {
            console.error('Error updating reps or challenge:', repError);
            // Don't fail the session end if rep update fails
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // Get active session for an activity
  static async getActiveSession(activityId: string): Promise<ActivitySession | null> {
    const { data, error } = await supabase
      .from("activity_sessions")
      .select("*")
      .eq("activity_id", activityId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch active session: ${error.message}`);
    }

    return data;
  }

  // Get timer status for an activity
  static async getTimerStatus(activityId: string): Promise<TimerStatus | null> {
    try {
      const session = await this.getActiveSession(activityId);
      if (!session) return null;

      const now = new Date();
      const startTime = new Date(session.start_time);
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      return {
        session,
        elapsed_minutes: elapsedMinutes,
        elapsed_seconds: elapsedSeconds,
        elapsed_milliseconds: elapsedMs,
        is_running: session.is_active,
        start_time: session.start_time,
        server_time: now.toISOString()
      };
    } catch (error) {
      console.error('Error getting timer status:', error);
      return null;
    }
  }

  // Get all sessions for an activity
  static async getActivitySessions(activityId: string, limit: number = 10): Promise<ActivitySession[]> {
    const { data, error } = await supabase
      .from("activity_sessions")
      .select("*")
      .eq("activity_id", activityId)
      .order("start_time", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch activity sessions: ${error.message}`);
    }

    return data || [];
  }
}