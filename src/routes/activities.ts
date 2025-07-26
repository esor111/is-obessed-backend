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
});