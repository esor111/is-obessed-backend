import { Router, Request, Response } from 'express';
import { db } from '../services/database';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all unique categories
 *     description: Retrieve a list of all unique categories from existing topics
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             example:
 *               - "Programming"
 *               - "Frontend"
 *               - "Backend"
 *               - "Database"
 *               - "DevOps"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await db.getUniqueCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;