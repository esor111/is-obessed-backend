export interface ActivityGoals {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Activity {
  id: string;
  name: string;
  reps: number;
  goals: ActivityGoals;
  created_at: string;
  updated_at: string;
}

export interface ActivitySession {
  id: string;
  activity_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  is_active: boolean;
  session_type: 'manual' | 'timer';
  created_at: string;
  updated_at: string;
}

export interface CreateActivityRequest {
  name: string;
  goals?: ActivityGoals;
}

export interface UpdateActivityRequest {
  name?: string;
  reps?: number;
  goals?: ActivityGoals;
}

export interface ActivityProgress {
  activity: Activity;
  daily_progress: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  weekly_progress: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  monthly_progress: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  yearly_progress: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  time_remaining_today: number; // minutes until end of day
}

export interface StartSessionRequest {
  activity_id: string;
  session_type?: 'manual' | 'timer';
}

export interface TimerStatus {
  session: ActivitySession;
  elapsed_minutes: number;
  elapsed_seconds: number;
  elapsed_milliseconds: number;
  is_running: boolean;
  start_time: string;
  server_time: string;
}