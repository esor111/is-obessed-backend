import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import ChallengeService from '../services/challengeService';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         challenge_name:
 *           type: string
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         ultimate_focus_goal_hours:
 *           type: integer
 *         is_active:
 *           type: boolean
 *     ChallengeProgress:
 *       type: object
 *       properties:
 *         countdown_seconds_remaining:
 *           type: integer
 *         daily_focus_minutes:
 *           type: integer
 *         is_active_period:
 *           type: boolean
 *         daily_quote:
 *           type: object
 *           properties:
 *             quote_text:
 *               type: string
 *             author:
 *               type: string
 */

/**
 * @swagger
 * /api/challenge:
 *   post:
 *     summary: Start a new 64-day challenge
 *     tags: [Challenge]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ultimate_focus_goal_hours:
 *                 type: integer
 *                 description: Total focus hours goal for 64 days
 *                 example: 500
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { ultimate_focus_goal_hours } = req.body;

    if (!ultimate_focus_goal_hours || ultimate_focus_goal_hours <= 0) {
      return res.status(400).json({ error: 'Ultimate focus goal hours must be a positive number' });
    }

    // Deactivate any existing challenges
    await supabase
      .from('motivational_challenges')
      .update({ is_active: false })
      .eq('is_active', true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 64);

    // Create new challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('motivational_challenges')
      .insert({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        ultimate_focus_goal_hours,
        is_active: true
      })
      .select()
      .single();

    if (challengeError) {
      throw challengeError;
    }

    // Calculate initial countdown seconds (64 days × 16 hours × 3600 seconds)
    const totalSeconds = 64 * 16 * 3600;

    // Create initial progress entry
    const { error: progressError } = await supabase
      .from('challenge_progress')
      .insert({
        challenge_id: challenge.id,
        progress_date: new Date().toISOString().split('T')[0],
        countdown_seconds_remaining: totalSeconds,
        daily_focus_minutes: 0
      });

    if (progressError) {
      throw progressError;
    }

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

/**
 * @swagger
 * /api/challenge/current:
 *   get:
 *     summary: Get current active challenge with progress
 *     tags: [Challenge]
 *     responses:
 *       200:
 *         description: Current challenge data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challenge:
 *                   $ref: '#/components/schemas/Challenge'
 *                 progress:
 *                   $ref: '#/components/schemas/ChallengeProgress'
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    // Get active challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('motivational_challenges')
      .select('*')
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'No active challenge found' });
    }

    // Get today's progress
    const today = new Date().toISOString().split('T')[0];
    const { data: progress, error: progressError } = await supabase
      .from('challenge_progress')
      .select(`
        *,
        daily_quote:daily_quote_id (
          quote_text,
          author,
          category
        )
      `)
      .eq('challenge_id', challenge.id)
      .eq('progress_date', today)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }

    // If no progress for today, create it
    if (!progress) {
      const { data: newProgress, error: createError } = await supabase
        .from('challenge_progress')
        .insert({
          challenge_id: challenge.id,
          progress_date: today,
          countdown_seconds_remaining: await calculateRemainingSeconds(challenge),
          daily_focus_minutes: 0
        })
        .select(`
          *,
          daily_quote:daily_quote_id (
            quote_text,
            author,
            category
          )
        `)
        .single();

      if (createError) {
        throw createError;
      }

      return res.json({
        challenge,
        progress: newProgress,
        is_active_period: isInActiveHours()
      });
    }

    res.json({
      challenge,
      progress,
      is_active_period: isInActiveHours()
    });
  } catch (error) {
    console.error('Error fetching current challenge:', error);
    res.status(500).json({ error: 'Failed to fetch current challenge' });
  }
});

/**
 * @swagger
 * /api/challenge/countdown/sync:
 *   post:
 *     summary: Sync countdown timer with server time
 *     tags: [Challenge]
 *     responses:
 *       200:
 *         description: Current countdown state
 */
router.post('/countdown/sync', async (req: Request, res: Response) => {
  try {
    // Get active challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('motivational_challenges')
      .select('*')
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'No active challenge found' });
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentMs = now.getMilliseconds();

    // Calculate daily countdown (16 hours = 57,600 seconds)
    let dailySecondsRemaining = 0;
    let isActiveHours = false;

    if (currentHour >= 7 && currentHour < 21) {
      // During active hours (7 AM - 9 PM)
      isActiveHours = true;
      const endOfActiveDay = new Date();
      endOfActiveDay.setHours(21, 0, 0, 0);
      dailySecondsRemaining = Math.floor((endOfActiveDay.getTime() - now.getTime()) / 1000);
    } else if (currentHour < 7) {
      // Before active hours - show full day
      dailySecondsRemaining = 16 * 3600; // 16 hours in seconds
    } else {
      // After active hours - day is over
      dailySecondsRemaining = 0;
    }

    // Calculate total challenge time remaining
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const totalSecondsRemaining = Math.max(0, (daysRemaining - 1) * 16 * 3600 + dailySecondsRemaining);

    const today = new Date().toISOString().split('T')[0];

    // Update or create today's progress
    const { data: existingProgress } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('challenge_id', challenge.id)
      .eq('progress_date', today)
      .single();

    if (existingProgress) {
      const { data: updatedProgress, error: updateError } = await supabase
        .from('challenge_progress')
        .update({
          countdown_seconds_remaining: totalSecondsRemaining,
          last_countdown_update: now.toISOString(),
          is_active_period: isActiveHours
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) throw updateError;
    } else {
      const { data: newProgress, error: createError } = await supabase
        .from('challenge_progress')
        .insert({
          challenge_id: challenge.id,
          progress_date: today,
          countdown_seconds_remaining: totalSecondsRemaining,
          daily_focus_minutes: 0,
          last_countdown_update: now.toISOString(),
          is_active_period: isActiveHours
        })
        .select()
        .single();

      if (createError) throw createError;
    }

    res.json({
      server_time: now.toISOString(),
      daily_seconds_remaining: dailySecondsRemaining,
      total_seconds_remaining: totalSecondsRemaining,
      is_active_hours: isActiveHours,
      current_hour: currentHour,
      days_remaining: daysRemaining
    });
  } catch (error) {
    console.error('Error syncing countdown:', error);
    res.status(500).json({ error: 'Failed to sync countdown' });
  }
});

/**
 * @swagger
 * /api/challenge/quote:
 *   get:
 *     summary: Get daily motivational quote
 *     tags: [Challenge]
 *     responses:
 *       200:
 *         description: Daily quote
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quote_text:
 *                   type: string
 *                 author:
 *                   type: string
 *                 category:
 *                   type: string
 */
router.get('/quote', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get active challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('motivational_challenges')
      .select('*')
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'No active challenge found' });
    }

    // Check if today's progress already has a quote
    const { data: progress, error: progressError } = await supabase
      .from('challenge_progress')
      .select(`
        daily_quote_id,
        daily_quote:daily_quote_id (
          quote_text,
          author,
          category
        )
      `)
      .eq('challenge_id', challenge.id)
      .eq('progress_date', today)
      .single();

    if (progress && progress.daily_quote) {
      return res.json(progress.daily_quote);
    }

    // Get a random quote for today
    const { data: quotes, error: quotesError } = await supabase
      .from('daily_motivational_quotes')
      .select('*')
      .eq('is_active', true);

    if (quotesError || !quotes || quotes.length === 0) {
      throw quotesError || new Error('No quotes available');
    }

    // Use date as seed for consistent daily quote
    const dateNumber = new Date(today).getTime();
    const quoteIndex = dateNumber % quotes.length;
    const dailyQuote = quotes[quoteIndex];

    // Update progress with today's quote
    if (progress) {
      await supabase
        .from('challenge_progress')
        .update({ daily_quote_id: dailyQuote.id })
        .eq('challenge_id', challenge.id)
        .eq('progress_date', today);
    }

    res.json({
      quote_text: dailyQuote.quote_text,
      author: dailyQuote.author,
      category: dailyQuote.category
    });
  } catch (error) {
    console.error('Error fetching daily quote:', error);
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

/**
 * @swagger
 * /api/challenge/stats:
 *   get:
 *     summary: Get comprehensive challenge statistics
 *     tags: [Challenge]
 *     responses:
 *       200:
 *         description: Challenge statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challenge:
 *                   $ref: '#/components/schemas/Challenge'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_focus_hours:
 *                       type: integer
 *                     progress_percentage:
 *                       type: number
 *                     days_remaining:
 *                       type: integer
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get active challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('motivational_challenges')
      .select('*')
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ error: 'No active challenge found' });
    }

    const stats = await ChallengeService.getChallengeStats(challenge.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    res.status(500).json({ error: 'Failed to fetch challenge stats' });
  }
});

/**
 * @swagger
 * /api/challenge/timer/status:
 *   get:
 *     summary: Get real-time timer status
 *     tags: [Challenge]
 *     responses:
 *       200:
 *         description: Current timer status with precise timing
 */
router.get('/timer/status', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentMs = now.getMilliseconds();

    // Calculate precise daily countdown
    let dailySecondsRemaining = 0;
    let dailyMillisecondsRemaining = 0;
    let isActiveHours = false;

    if (currentHour >= 7 && currentHour < 21) {
      // During active hours
      isActiveHours = true;
      const endOfActiveDay = new Date();
      endOfActiveDay.setHours(21, 0, 0, 0);
      const msRemaining = endOfActiveDay.getTime() - now.getTime();
      dailySecondsRemaining = Math.floor(msRemaining / 1000);
      dailyMillisecondsRemaining = msRemaining % 1000;
    } else if (currentHour < 7) {
      // Before active hours
      dailySecondsRemaining = 16 * 3600;
      dailyMillisecondsRemaining = 0;
    } else {
      // After active hours
      dailySecondsRemaining = 0;
      dailyMillisecondsRemaining = 0;
    }

    // Calculate total challenge time remaining (64 days)
    const { data: challenge } = await supabase
      .from('motivational_challenges')
      .select('*')
      .eq('is_active', true)
      .single();

    let totalSecondsRemaining = 0;
    let totalDaysRemaining = 0;
    
    if (challenge) {
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      totalDaysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calculate total seconds: remaining full days + today's remaining time
      const fullDaysRemaining = Math.max(0, totalDaysRemaining - 1);
      totalSecondsRemaining = fullDaysRemaining * 16 * 3600 + dailySecondsRemaining;
    }

    res.json({
      server_time: now.toISOString(),
      server_timestamp: now.getTime(),
      daily_seconds_remaining: dailySecondsRemaining,
      daily_milliseconds_remaining: dailyMillisecondsRemaining,
      total_seconds_remaining: totalSecondsRemaining,
      total_days_remaining: totalDaysRemaining,
      is_active_hours: isActiveHours,
      current_hour: currentHour,
      current_minute: currentMinute,
      current_second: currentSecond,
      current_millisecond: currentMs,
      active_hours_start: 7,
      active_hours_end: 21
    });
  } catch (error) {
    console.error('Error getting timer status:', error);
    res.status(500).json({ error: 'Failed to get timer status' });
  }
});

// Helper functions
function isInActiveHours(): boolean {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 7 && hours < 21; // 7 AM to 9 PM
}

async function calculateRemainingSeconds(challenge: any): Promise<number> {
  const now = new Date();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  
  if (now >= endDate) return 0;
  
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysRemaining * 16 * 3600); // 16 hours per day
}

async function getCurrentCountdownSeconds(challengeId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('countdown_seconds_remaining')
    .eq('challenge_id', challengeId)
    .eq('progress_date', today)
    .single();

  if (error || !data) return 0;
  return data.countdown_seconds_remaining;
}

export default router;