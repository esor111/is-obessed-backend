import { Router, Request, Response } from 'express';
import { db } from '../services/database';
import { validateCreateTopic, validateUpdateTopic, ValidationError, isValidUUID } from '../utils/validation';
import { 
  updateTopicCalculations,
  transformTopicToApiFormat,
  transformTopicToDbFormat
} from '../utils/calculations';

const router = Router();

/**
 * @swagger
 * /api/topics/{topicId}:
 *   get:
 *     summary: Get a specific topic with all subtopics
 *     description: Retrieve a topic by ID including all its subtopics and calculated values
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The topic ID
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Invalid topic ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Topic not found
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

// GET /api/topics/:topicId
router.get('/:topicId', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    if (!isValidUUID(topicId)) {
      return res.status(400).json({ error: 'Invalid topic ID format' });
    }

    const topic = await db.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Get subtopics for this topic
    const subtopics = await db.getSubtopicsByTopicId(topicId);

    // Update topic with calculated values
    const updatedTopic = updateTopicCalculations(topic, subtopics);

    // Update the database with calculated values
    await db.updateTopic(topicId, {
      earnings: updatedTopic.earnings,
      completion_percentage: updatedTopic.completion_percentage
    });

    // Transform to API format
    const apiResponse = transformTopicToApiFormat(updatedTopic);

    res.json(apiResponse);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

/**
 * @swagger
 * /api/topics:
 *   post:
 *     summary: Create a new topic
 *     description: Create a new topic with the provided details
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTopicRequest'
 *           example:
 *             title: "Python Basics"
 *             category: "Programming"
 *             notes: "Start with syntax and basic concepts"
 *             urls: ["https://python.org/docs"]
 *             moneyPer5Reps: 30.00
 *             isMoneyPer5RepsLocked: false
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
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

// POST /api/topics
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = validateCreateTopic(req.body);
    
    // Transform to database format
    const dbData = transformTopicToDbFormat(validatedData);

    // Create topic
    const newTopic = await db.createTopic(dbData);

    // Transform to API format (no subtopics yet)
    const apiResponse = transformTopicToApiFormat({
      ...newTopic,
      subtopics: []
    });

    res.status(201).json(apiResponse);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Create topic error:', error);
      res.status(500).json({ error: 'Failed to create topic' });
    }
  }
});

/**
 * @swagger
 * /api/topics/{topicId}:
 *   put:
 *     summary: Update an existing topic
 *     description: Update a topic with partial data and recalculate earnings/completion
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               moneyPer5Reps:
 *                 type: number
 *                 format: float
 *               isMoneyPer5RepsLocked:
 *                 type: boolean
 *           example:
 *             title: "Advanced JavaScript"
 *             notes: "Updated focus on advanced concepts"
 *             moneyPer5Reps: 35.00
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Invalid request data or topic ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Topic not found
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

// PUT /api/topics/:topicId
router.put('/:topicId', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    if (!isValidUUID(topicId)) {
      return res.status(400).json({ error: 'Invalid topic ID format' });
    }

    // Check if topic exists
    const existingTopic = await db.getTopicById(topicId);
    if (!existingTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const validatedUpdates = validateUpdateTopic(req.body);
    
    // Transform to database format
    const dbUpdates: any = {};
    if (validatedUpdates.title) dbUpdates.title = validatedUpdates.title;
    if (validatedUpdates.category) dbUpdates.category = validatedUpdates.category;
    if (validatedUpdates.notes !== undefined) dbUpdates.notes = validatedUpdates.notes;
    if (validatedUpdates.urls !== undefined) dbUpdates.urls = validatedUpdates.urls;
    if (validatedUpdates.moneyPer5Reps !== undefined) dbUpdates.money_per_5_reps = validatedUpdates.moneyPer5Reps;
    if (validatedUpdates.isMoneyPer5RepsLocked !== undefined) dbUpdates.is_money_per_5_reps_locked = validatedUpdates.isMoneyPer5RepsLocked;

    // Update topic
    const updatedTopic = await db.updateTopic(topicId, dbUpdates);

    // Get subtopics and recalculate
    const subtopics = await db.getSubtopicsByTopicId(topicId);
    const topicWithCalculations = updateTopicCalculations(updatedTopic, subtopics);

    // Update calculated values in database
    await db.updateTopic(topicId, {
      earnings: topicWithCalculations.earnings,
      completion_percentage: topicWithCalculations.completion_percentage
    });

    // Transform to API format
    const apiResponse = transformTopicToApiFormat(topicWithCalculations);

    res.json(apiResponse);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update topic error:', error);
      res.status(500).json({ error: 'Failed to update topic' });
    }
  }
});

export default router;