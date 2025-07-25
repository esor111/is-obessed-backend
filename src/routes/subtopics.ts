import { Router, Request, Response } from 'express';
import { db } from '../services/database';
import { 
  validateCreateSubtopic, 
  validateUpdateSubtopic, 
  validateAddReps, 
  ValidationError, 
  isValidUUID 
} from '../utils/validation';
import { 
  updateTopicCalculations,
  transformTopicToApiFormat,
  transformSubtopicToApiFormat,
  transformSubtopicToDbFormat
} from '../utils/calculations';

const router = Router();

/**
 * @swagger
 * /api/sub-topics/{subtopicId}:
 *   get:
 *     summary: Get a specific subtopic
 *     description: Retrieve a subtopic by ID
 *     tags: [Subtopics]
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subtopic ID
 *     responses:
 *       200:
 *         description: Subtopic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       400:
 *         description: Invalid subtopic ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subtopic not found
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

// GET /api/sub-topics/:subtopicId
router.get('/:subtopicId', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;

    if (!isValidUUID(subtopicId)) {
      return res.status(400).json({ error: 'Invalid subtopic ID format' });
    }

    const subtopic = await db.getSubtopicById(subtopicId);
    if (!subtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    const apiResponse = transformSubtopicToApiFormat(subtopic);
    res.json(apiResponse);
  } catch (error) {
    console.error('Get subtopic error:', error);
    res.status(500).json({ error: 'Failed to fetch subtopic' });
  }
});

/**
 * @swagger
 * /api/topics/{topicId}/sub-topics:
 *   post:
 *     summary: Create a new subtopic within a topic
 *     description: Create a new subtopic and update parent topic calculations
 *     tags: [Subtopics]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The parent topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubtopicRequest'
 *           example:
 *             title: "Arrow Functions"
 *             goalAmount: 1000
 *             notes: "Focus on syntax and use cases"
 *             urls: ["https://example.com/arrow-functions"]
 *     responses:
 *       201:
 *         description: Subtopic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subTopic:
 *                   $ref: '#/components/schemas/Subtopic'
 *                 updatedTopic:
 *                   $ref: '#/components/schemas/Topic'
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

// POST /api/topics/:topicId/sub-topics
router.post('/topics/:topicId/sub-topics', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    if (!isValidUUID(topicId)) {
      return res.status(400).json({ error: 'Invalid topic ID format' });
    }

    // Check if topic exists
    const topic = await db.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const validatedData = validateCreateSubtopic(req.body);
    
    // Transform to database format
    const dbData = transformSubtopicToDbFormat(validatedData, topicId);

    // Create subtopic
    const newSubtopic = await db.createSubtopic(dbData);

    // Get all subtopics for the topic to recalculate
    const allSubtopics = await db.getSubtopicsByTopicId(topicId);

    // Update topic calculations
    const updatedTopic = updateTopicCalculations(topic, allSubtopics);

    // Update topic in database
    await db.updateTopic(topicId, {
      earnings: updatedTopic.earnings,
      completion_percentage: updatedTopic.completion_percentage
    });

    // Transform responses to API format
    const subTopicResponse = transformSubtopicToApiFormat(newSubtopic);
    const updatedTopicResponse = transformTopicToApiFormat(updatedTopic);

    res.status(201).json({
      subTopic: subTopicResponse,
      updatedTopic: updatedTopicResponse
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Create subtopic error:', error);
      res.status(500).json({ error: 'Failed to create subtopic' });
    }
  }
});

/**
 * @swagger
 * /api/sub-topics/{subtopicId}:
 *   put:
 *     summary: Update an existing subtopic
 *     description: Update a subtopic with partial data
 *     tags: [Subtopics]
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subtopic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               goalAmount:
 *                 type: number
 *                 format: float
 *                 description: Must be multiple of 1000
 *           example:
 *             notes: "Updated practice notes with more examples"
 *             goalAmount: 2000
 *     responses:
 *       200:
 *         description: Subtopic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtopic'
 *       400:
 *         description: Invalid request data or subtopic ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subtopic not found
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

// PUT /api/sub-topics/:subtopicId
router.put('/:subtopicId', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;

    if (!isValidUUID(subtopicId)) {
      return res.status(400).json({ error: 'Invalid subtopic ID format' });
    }

    // Check if subtopic exists
    const existingSubtopic = await db.getSubtopicById(subtopicId);
    if (!existingSubtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    const validatedUpdates = validateUpdateSubtopic(req.body);
    
    // Transform to database format
    const dbUpdates: any = {};
    if (validatedUpdates.title) dbUpdates.title = validatedUpdates.title;
    if (validatedUpdates.notes !== undefined) dbUpdates.notes = validatedUpdates.notes;
    if (validatedUpdates.urls !== undefined) dbUpdates.urls = validatedUpdates.urls;
    if (validatedUpdates.goalAmount !== undefined) dbUpdates.goal_amount = validatedUpdates.goalAmount;

    // Update subtopic
    const updatedSubtopic = await db.updateSubtopic(subtopicId, dbUpdates);

    // Transform to API format
    const apiResponse = transformSubtopicToApiFormat(updatedSubtopic);

    res.json(apiResponse);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update subtopic error:', error);
      res.status(500).json({ error: 'Failed to update subtopic' });
    }
  }
});

/**
 * @swagger
 * /api/sub-topics/{subtopicId}/reps:
 *   post:
 *     summary: Add or subtract repetitions from a subtopic
 *     description: Update the reps completed count and recalculate parent topic metrics
 *     tags: [Subtopics]
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subtopic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRepsRequest'
 *           example:
 *             reps: 1
 *     responses:
 *       200:
 *         description: Reps updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedSubtopic:
 *                   $ref: '#/components/schemas/Subtopic'
 *                 updatedTopic:
 *                   $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Invalid request data or subtopic ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subtopic not found
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

// POST /api/sub-topics/:subtopicId/reps
router.post('/:subtopicId/reps', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;

    if (!isValidUUID(subtopicId)) {
      return res.status(400).json({ error: 'Invalid subtopic ID format' });
    }

    // Check if subtopic exists
    const existingSubtopic = await db.getSubtopicById(subtopicId);
    if (!existingSubtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    const validatedData = validateAddReps(req.body);
    
    // Calculate new reps count (ensure it doesn't go below 0)
    const newRepsCompleted = Math.max(0, existingSubtopic.reps_completed + validatedData.reps);

    // Update subtopic with new reps count
    const updatedSubtopic = await db.updateSubtopic(subtopicId, {
      reps_completed: newRepsCompleted
    });

    // Get topic and all its subtopics to recalculate
    const topic = await db.getTopicById(existingSubtopic.topic_id);
    if (!topic) {
      return res.status(500).json({ error: 'Parent topic not found' });
    }

    const allSubtopics = await db.getSubtopicsByTopicId(existingSubtopic.topic_id);

    // Update topic calculations
    const updatedTopic = updateTopicCalculations(topic, allSubtopics);

    // Update topic in database
    await db.updateTopic(existingSubtopic.topic_id, {
      earnings: updatedTopic.earnings,
      completion_percentage: updatedTopic.completion_percentage
    });

    // Transform responses to API format
    const updatedSubtopicResponse = transformSubtopicToApiFormat(updatedSubtopic);
    const updatedTopicResponse = transformTopicToApiFormat(updatedTopic);

    res.json({
      updatedSubtopic: updatedSubtopicResponse,
      updatedTopic: updatedTopicResponse
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Add reps error:', error);
      res.status(500).json({ error: 'Failed to update reps' });
    }
  }
});

export default router;