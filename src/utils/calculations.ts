import { Topic, Subtopic } from '../types';

/**
 * Calculate topic earnings based on total reps completed across all subtopics
 * Formula: Math.floor(totalRepsFromAllSubtopics / 5) * moneyPer5Reps
 */
export const calculateTopicEarnings = (subtopics: Subtopic[], moneyPer5Reps: number): number => {
  const totalReps = subtopics.reduce((sum, subtopic) => sum + subtopic.reps_completed, 0);
  return Math.floor(totalReps / 5) * moneyPer5Reps;
};

/**
 * Calculate topic completion percentage based on subtopics progress
 * Formula: (totalRepsCompleted / totalRepsGoal) * 100
 */
export const calculateTopicCompletionPercentage = (subtopics: Subtopic[]): number => {
  if (subtopics.length === 0) return 0;

  const totalCompleted = subtopics.reduce((sum, subtopic) => sum + subtopic.reps_completed, 0);
  const totalGoal = subtopics.reduce((sum, subtopic) => sum + subtopic.reps_goal, 0);

  if (totalGoal === 0) return 0;

  return (totalCompleted / totalGoal) * 100;
};

/**
 * Calculate subtopic milestone earnings based on completion
 * Formula: Math.floor((repsCompleted * goalAmount / 18) / 1000) * 1000
 */
export const calculateSubtopicMilestoneEarnings = (repsCompleted: number, goalAmount: number): number => {
  const progressRatio = repsCompleted / 18; // repsGoal is always 18
  const earnedAmount = progressRatio * goalAmount;
  return Math.floor(earnedAmount / 1000) * 1000;
};

/**
 * Calculate dashboard progress percentage
 * Formula: (currentEarnings / globalGoal) * 100
 */
export const calculateDashboardProgress = (currentEarnings: number, globalGoal: number): number => {
  if (globalGoal <= 0) return 0;
  return (currentEarnings / globalGoal) * 100;
};

/**
 * Calculate total current earnings from all topics
 */
export const calculateTotalEarnings = (topics: Topic[]): number => {
  return topics.reduce((sum, topic) => sum + topic.earnings, 0);
};

/**
 * Update topic with calculated values based on its subtopics
 */
export const updateTopicCalculations = (topic: Topic, subtopics: Subtopic[]): Topic => {
  return {
    ...topic,
    earnings: calculateTopicEarnings(subtopics, topic.money_per_5_reps),
    completion_percentage: calculateTopicCompletionPercentage(subtopics),
    subtopics
  };
};

/**
 * Transform database topic to API response format
 */
export const transformTopicToApiFormat = (topic: Topic): any => {
  return {
    id: topic.id,
    title: topic.title,
    category: topic.category,
    earnings: topic.earnings,
    completionPercentage: topic.completion_percentage,
    notes: topic.notes,
    urls: topic.urls,
    moneyPer5Reps: topic.money_per_5_reps,
    isMoneyPer5RepsLocked: topic.is_money_per_5_reps_locked,
    subtopics: topic.subtopics?.map(transformSubtopicToApiFormat) || []
  };
};

/**
 * Transform database subtopic to API response format
 */
export const transformSubtopicToApiFormat = (subtopic: Subtopic): any => {
  return {
    id: subtopic.id,
    title: subtopic.title,
    repsCompleted: subtopic.reps_completed,
    repsGoal: subtopic.reps_goal,
    notes: subtopic.notes,
    urls: subtopic.urls,
    goalAmount: subtopic.goal_amount
  };
};

/**
 * Transform API request to database format for topics
 */
export const transformTopicToDbFormat = (apiData: any): any => {
  return {
    title: apiData.title,
    category: apiData.category,
    notes: apiData.notes || '',
    urls: apiData.urls || [],
    money_per_5_reps: apiData.moneyPer5Reps,
    is_money_per_5_reps_locked: apiData.isMoneyPer5RepsLocked || false
  };
};

/**
 * Transform API request to database format for subtopics
 */
export const transformSubtopicToDbFormat = (apiData: any, topicId: string): any => {
  return {
    topic_id: topicId,
    title: apiData.title,
    notes: apiData.notes || '',
    urls: apiData.urls || [],
    goal_amount: apiData.goalAmount
  };
};