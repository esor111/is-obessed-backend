import { supabase } from '../config/supabase';

export class ChallengeService {
  /**
   * Update daily focus hours when a focus session ends
   */
  static async updateDailyFocusHours(durationMinutes: number): Promise<void> {
    try {
      // Get active challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('motivational_challenges')
        .select('*')
        .eq('is_active', true)
        .single();

      if (challengeError || !challenge) {
        console.log('No active challenge found, skipping focus hours update');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Get or create today's progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('progress_date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('challenge_progress')
          .update({
            daily_focus_minutes: existingProgress.daily_focus_minutes + durationMinutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new progress entry
        const totalSeconds = await this.calculateRemainingSeconds(challenge);
        
        const { error: createError } = await supabase
          .from('challenge_progress')
          .insert({
            challenge_id: challenge.id,
            progress_date: today,
            daily_focus_minutes: durationMinutes,
            countdown_seconds_remaining: totalSeconds
          });

        if (createError) {
          throw createError;
        }
      }

      console.log(`Updated daily focus hours: +${durationMinutes} minutes`);
    } catch (error) {
      console.error('Error updating daily focus hours:', error);
    }
  }

  /**
   * Get challenge statistics and progress
   */
  static async getChallengeStats(challengeId: string) {
    try {
      // Get challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('motivational_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        throw challengeError;
      }

      // Get all progress data
      const { data: progressData, error: progressError } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('progress_date', { ascending: true });

      if (progressError) {
        throw progressError;
      }

      // Calculate statistics
      const totalFocusMinutes = progressData.reduce((sum, day) => sum + (day.daily_focus_minutes || 0), 0);
      const totalFocusHours = Math.floor(totalFocusMinutes / 60);
      const daysActive = progressData.length;
      const daysRemaining = Math.max(0, 64 - daysActive);
      const progressPercentage = Math.min(100, (totalFocusHours / challenge.ultimate_focus_goal_hours) * 100);

      // Get current countdown
      const today = new Date().toISOString().split('T')[0];
      const todayProgress = progressData.find(p => p.progress_date === today);
      const currentCountdown = todayProgress?.countdown_seconds_remaining || 0;

      return {
        challenge,
        stats: {
          total_focus_hours: totalFocusHours,
          total_focus_minutes: totalFocusMinutes,
          ultimate_goal_hours: challenge.ultimate_focus_goal_hours,
          progress_percentage: Math.round(progressPercentage * 100) / 100,
          days_active: daysActive,
          days_remaining: daysRemaining,
          current_countdown_seconds: currentCountdown,
          average_daily_minutes: daysActive > 0 ? Math.round(totalFocusMinutes / daysActive) : 0
        },
        daily_progress: progressData
      };
    } catch (error) {
      console.error('Error getting challenge stats:', error);
      throw error;
    }
  }

  /**
   * Calculate remaining seconds for a challenge
   */
  private static async calculateRemainingSeconds(challenge: any): Promise<number> {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    
    if (now >= endDate) return 0;
    
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining * 16 * 3600); // 16 hours per day
  }

  /**
   * Check if current time is within active hours (7 AM - 9 PM)
   */
  static isInActiveHours(): boolean {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 7 && hours < 21;
  }

  /**
   * Get time remaining in current active period
   */
  static getActiveHoursRemaining(): number {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (hours < 7) {
      // Before active hours - return 0
      return 0;
    } else if (hours >= 21) {
      // After active hours - return 0
      return 0;
    } else {
      // During active hours - calculate remaining seconds until 9 PM
      const endOfDay = new Date();
      endOfDay.setHours(21, 0, 0, 0);
      return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    }
  }
}

export default ChallengeService;