import { Router, Request, Response } from 'express';
import { db } from '../services/database';
import { validateUpdateGlobalGoal, ValidationError } from '../utils/validation';
import { 
  calculateTopicEarnings, 
  calculateTopicCompletionPercentage, 
  calculateDashboardProgress,
  calculateTotalEarnings,
  updateTopicCalculations
} from '../utils/calculations';

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard overview data
 *     description: Retrieve global goal, current earnings, progress percentage, and topic summaries
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardData'
 *             example:
 *               globalGoal: 5000
 *               currentEarnings: 1250.50
 *               progress: 25.01
 *               topics:
 *                 - id: "uuid-string"
 *                   title: "JavaScript Fundamentals"
 *                   category: "Programming"
 *                   earnings: 450.00
 *                   completionPercentage: 75.5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/dashboard
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get global goal
    const globalGoalSetting = await db.getGlobalSetting('global_goal');
    const globalGoal = globalGoalSetting?.value || 5000;

    // Get all topics
    const topics = await db.getAllTopics();

    // Calculate earnings and completion for each topic
    const topicsWithCalculations = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await db.getSubtopicsByTopicId(topic.id);
        const earnings = calculateTopicEarnings(subtopics, topic.money_per_5_reps);
        const completionPercentage = calculateTopicCompletionPercentage(subtopics);

        // Update topic in database with calculated values
        await db.updateTopic(topic.id, {
          earnings,
          completion_percentage: completionPercentage
        });

        return {
          id: topic.id,
          title: topic.title,
          category: topic.category,
          earnings,
          completionPercentage
        };
      })
    );

    // Calculate total earnings and progress
    const currentEarnings = topicsWithCalculations.reduce((sum, topic) => sum + topic.earnings, 0);
    const progress = calculateDashboardProgress(currentEarnings, globalGoal);

    const dashboardData = {
      globalGoal,
      currentEarnings,
      progress,
      topics: topicsWithCalculations
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * @swagger
 * /api/dashboard/global-goal:
 *   put:
 *     summary: Update global earnings goal
 *     description: Update the global earnings goal and recalculate progress
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGlobalGoalRequest'
 *           example:
 *             globalGoal: 6000
 *     responses:
 *       200:
 *         description: Global goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 globalGoal:
 *                   type: number
 *                   format: float
 *                 currentEarnings:
 *                   type: number
 *                   format: float
 *                 progress:
 *                   type: number
 *                   format: float
 *             example:
 *               globalGoal: 6000
 *               currentEarnings: 1250.50
 *               progress: 20.84
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// PUT /api/dashboard/global-goal
router.put('/global-goal', async (req: Request, res: Response) => {
  try {
    const validatedData = validateUpdateGlobalGoal(req.body);
    
    // Update global goal
    await db.updateGlobalSetting('global_goal', validatedData.globalGoal);

    // Get current earnings to calculate new progress
    const topics = await db.getAllTopics();
    const topicsWithEarnings = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await db.getSubtopicsByTopicId(topic.id);
        return {
          ...topic,
          earnings: calculateTopicEarnings(subtopics, topic.money_per_5_reps)
        };
      })
    );

    const currentEarnings = calculateTotalEarnings(topicsWithEarnings);
    const progress = calculateDashboardProgress(currentEarnings, validatedData.globalGoal);

    res.json({
      globalGoal: validatedData.globalGoal,
      currentEarnings,
      progress
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update global goal error:', error);
      res.status(500).json({ error: 'Failed to update global goal' });
    }
  }
});

export default router;