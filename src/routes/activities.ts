import express from "express";
import { ActivityService } from "../services/activityService";
import { CreateActivityRequest, UpdateActivityRequest, StartSessionRequest } from "../types/activity";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityGoals:
 *       type: object
 *       properties:
 *         daily:
 *           type: integer
 *           description: Daily goal target
 *         weekly:
 *           type: integer
 *           description: Weekly goal target
 *         monthly:
 *           type: integer
 *           description: Monthly goal target
 *         yearly:
 *           type: integer
 *           description: Yearly goal target
 *     
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         reps:
 *           type: integer
 *         goals:
 *           $ref: '#/components/schemas/ActivityGoals'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     CreateActivityRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         goals:
 *           $ref: '#/components/schemas/ActivityGoals'
 *     
 *     UpdateActivityRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         reps:
 *           type: integer
 *         goals:
 *           $ref: '#/components/schemas/ActivityGoals'
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const activities = await ActivityService.getAllActivities();
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const activity = await ActivityService.getActivityById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create new activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityRequest'
 *     responses:
 *       201:
 *         description: Activity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const activityData: CreateActivityRequest = req.body;
    
    if (!activityData.name || activityData.name.trim() === "") {
      return res.status(400).json({ error: "Activity name is required" });
    }

    const activity = await ActivityService.createActivity(activityData);
    res.status(201).json(activity);
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update activity
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityRequest'
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const updates: UpdateActivityRequest = req.body;
    const activity = await ActivityService.updateActivity(req.params.id, updates);
    res.json(activity);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete activity
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Activity deleted successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    await ActivityService.deleteActivity(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});/*
*
 * @swagger
 * /api/activities/{id}/increment:
 *   post:
 *     summary: Increment activity reps
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 default: 1
 *                 description: Amount to increment by
 *     responses:
 *       200:
 *         description: Activity reps incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/increment", async (req, res) => {
  try {
    const amount = req.body.amount || 1;
    const activity = await ActivityService.incrementReps(req.params.id, amount);
    res.json(activity);
  } catch (error) {
    console.error("Error incrementing activity reps:", error);
    res.status(500).json({ error: "Failed to increment activity reps" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/decrement:
 *   post:
 *     summary: Decrement activity reps
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 default: 1
 *                 description: Amount to decrement by
 *     responses:
 *       200:
 *         description: Activity reps decremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/decrement", async (req, res) => {
  try {
    const amount = req.body.amount || 1;
    const activity = await ActivityService.decrementReps(req.params.id, amount);
    res.json(activity);
  } catch (error) {
    console.error("Error decrementing activity reps:", error);
    res.status(500).json({ error: "Failed to decrement activity reps" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/progress:
 *   get:
 *     summary: Get activity progress with goal tracking
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: '#/components/schemas/Activity'
 *                 daily_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 weekly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 monthly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 yearly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 time_remaining_today:
 *                   type: integer
 *                   description: Minutes remaining in current day
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.get("/:id/progress", async (req, res) => {
  try {
    const progress = await ActivityService.getActivityProgress(req.params.id);
    if (!progress) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(progress);
  } catch (error) {
    console.error("Error fetching activity progress:", error);
    res.status(500).json({ error: "Failed to fetch activity progress" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions/start:
 *   post:
 *     summary: Start a new activity session (timer)
 *     tags: [Activities, Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_type:
 *                 type: string
 *                 enum: [manual, timer]
 *                 default: timer
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 activity_id:
 *                   type: string
 *                   format: uuid
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                 is_active:
 *                   type: boolean
 *                 session_type:
 *                   type: string
 *       400:
 *         description: Activity already has an active session
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/sessions/start", async (req, res) => {
  try {
    const sessionData: StartSessionRequest = {
      activity_id: req.params.id,
      session_type: req.body.session_type || 'timer'
    };
    
    const session = await ActivityService.startSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting session:", error);
    if (error.message.includes("already has an active session")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to start session" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions/{sessionId}/end:
 *   post:
 *     summary: End an active session
 *     tags: [Activities, Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 activity_id:
 *                   type: string
 *                   format: uuid
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                 end_time:
 *                   type: string
 *                   format: date-time
 *                 duration_minutes:
 *                   type: integer
 *                 is_active:
 *                   type: boolean
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post("/:id/sessions/:sessionId/end", async (req, res) => {
  try {
    const session = await ActivityService.endSession(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/timer:
 *   get:
 *     summary: Get current timer status for activity
 *     tags: [Activities, Timer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Timer status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 elapsed_minutes:
 *                   type: integer
 *                 is_running:
 *                   type: boolean
 *       404:
 *         description: No active timer found
 *       500:
 *         description: Server error
 */
router.get("/:id/timer", async (req, res) => {
  try {
    const timerStatus = await ActivityService.getTimerStatus(req.params.id);
    if (!timerStatus) {
      return res.status(404).json({ error: "No active timer found" });
    }
    res.json(timerStatus);
  } catch (error) {
    console.error("Error fetching timer status:", error);
    res.status(500).json({ error: "Failed to fetch timer status" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions:
 *   get:
 *     summary: Get activity sessions history
 *     tags: [Activities, Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of activity sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   activity_id:
 *                     type: string
 *                     format: uuid
 *                   start_time:
 *                     type: string
 *                     format: date-time
 *                   end_time:
 *                     type: string
 *                     format: date-time
 *                   duration_minutes:
 *                     type: integer
 *                   is_active:
 *                     type: boolean
 *                   session_type:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/:id/sessions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sessions = await ActivityService.getActivitySessions(req.params.id, limit);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching activity sessions:", error);
    res.status(500).json({ error: "Failed to fetch activity sessions" });
  }
});

export default router;/**
 *
 @swagger
 * /api/activities/{id}/increment:
 *   post:
 *     summary: Increment activity reps
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Activity reps incremented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/increment", async (req, res) => {
  try {
    const amount = req.body.amount || 1;
    const activity = await ActivityService.incrementReps(req.params.id, amount);
    res.json(activity);
  } catch (error) {
    console.error("Error incrementing activity reps:", error);
    res.status(500).json({ error: "Failed to increment activity reps" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/decrement:
 *   post:
 *     summary: Decrement activity reps
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Activity reps decremented
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/decrement", async (req, res) => {
  try {
    const amount = req.body.amount || 1;
    const activity = await ActivityService.decrementReps(req.params.id, amount);
    res.json(activity);
  } catch (error) {
    console.error("Error decrementing activity reps:", error);
    res.status(500).json({ error: "Failed to decrement activity reps" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/progress:
 *   get:
 *     summary: Get activity progress with goal tracking
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   $ref: '#/components/schemas/Activity'
 *                 daily_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 weekly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 monthly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 yearly_progress:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     target:
 *                       type: integer
 *                     percentage:
 *                       type: number
 *                     remaining:
 *                       type: integer
 *                 time_remaining_today:
 *                   type: integer
 *                   description: Minutes remaining in current day
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.get("/:id/progress", async (req, res) => {
  try {
    const progress = await ActivityService.getActivityProgress(req.params.id);
    if (!progress) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(progress);
  } catch (error) {
    console.error("Error fetching activity progress:", error);
    res.status(500).json({ error: "Failed to fetch activity progress" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions/start:
 *   post:
 *     summary: Start a new activity session
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_type:
 *                 type: string
 *                 enum: [manual, timer]
 *                 default: manual
 *     responses:
 *       201:
 *         description: Session started successfully
 *       400:
 *         description: Activity already has an active session
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.post("/:id/sessions/start", async (req, res) => {
  try {
    const sessionData: StartSessionRequest = {
      activity_id: req.params.id,
      session_type: req.body.session_type || 'manual'
    };
    
    const session = await ActivityService.startSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting session:", error);
    if (error.message.includes("already has an active session")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to start session" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions/{sessionId}/end:
 *   post:
 *     summary: End an activity session
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post("/:id/sessions/:sessionId/end", async (req, res) => {
  try {
    const session = await ActivityService.endSession(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/timer:
 *   get:
 *     summary: Get timer status for an activity
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Timer status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                 elapsed_minutes:
 *                   type: integer
 *                 is_running:
 *                   type: boolean
 *       404:
 *         description: No active timer found
 *       500:
 *         description: Server error
 */
router.get("/:id/timer", async (req, res) => {
  try {
    const timerStatus = await ActivityService.getTimerStatus(req.params.id);
    if (!timerStatus) {
      return res.status(404).json({ error: "No active timer found" });
    }
    res.json(timerStatus);
  } catch (error) {
    console.error("Error fetching timer status:", error);
    res.status(500).json({ error: "Failed to fetch timer status" });
  }
});

/**
 * @swagger
 * /api/activities/{id}/sessions:
 *   get:
 *     summary: Get activity sessions history
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of activity sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get("/:id/sessions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sessions = await ActivityService.getActivitySessions(req.params.id, limit);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching activity sessions:", error);
    res.status(500).json({ error: "Failed to fetch activity sessions" });
  }
});

export default router;