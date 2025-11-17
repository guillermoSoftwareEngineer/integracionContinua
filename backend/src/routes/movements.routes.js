import express from 'express';
import {
  createMovement,
  updateMovement,
  getMovements,
  getSummary,
  clearAll,
} from '../controllers/movements.controller.js';

const router = express.Router();

router.post('/', createMovement);
router.patch('/:id', updateMovement);
router.get('/', getMovements);
router.get('/summary', getSummary);
router.delete('/clear-all', clearAll);

export default router;
