import express from 'express';
import { getPOIs, createPOI, updatePOI, deletePOI } from '../controllers/poiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes pour /api/poi
router.get('/', protect, getPOIs);
router.post('/', protect, createPOI);
router.put('/:id', protect, updatePOI);
router.delete('/:id', protect, deletePOI);

export default router;
