export interface Subtopic {
  id: string;
  topic_id: string;
  title: string;
  reps_completed: number;
  reps_goal: number; // Always 18
  notes: string;
  urls: string[];
  goal_amount: number; // Must be multiple of 1000
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  earnings: number; // Calculated field
  completion_percentage: number; // Calculated field
  notes: string;
  urls: string[];
  money_per_5_reps: number;
  is_money_per_5_reps_locked: boolean;
  created_at: string;
  updated_at: string;
  subtopics?: Subtopic[];
}

export interface GlobalSetting {
  id: string;
  key: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  globalGoal: number;
  currentEarnings: number;
  progress: number;
  topics: {
    id: string;
    title: string;
    category: string;
    earnings: number;
    completionPercentage: number;
  }[];
}

// API Request/Response types
export interface CreateTopicRequest {
  title: string;
  category: string;
  notes?: string;
  urls?: string[];
  moneyPer5Reps: number;
  isMoneyPer5RepsLocked?: boolean;
}

export interface UpdateTopicRequest {
  title?: string;
  category?: string;
  notes?: string;
  urls?: string[];
  moneyPer5Reps?: number;
  isMoneyPer5RepsLocked?: boolean;
}

export interface CreateSubtopicRequest {
  title: string;
  goalAmount: number;
  notes?: string;
  urls?: string[];
}

export interface UpdateSubtopicRequest {
  title?: string;
  notes?: string;
  urls?: string[];
  goalAmount?: number;
}

export interface AddRepsRequest {
  reps: number; // Can be positive or negative
}

export interface UpdateGlobalGoalRequest {
  globalGoal: number;
}