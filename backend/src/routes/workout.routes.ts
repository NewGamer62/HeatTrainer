// Auteur : Noa Gaillard

import { Router } from 'express';
import { createWorkoutSession, getWorkoutHistory, deleteWorkoutSession, updateWorkoutSession } from '../controllers/workout.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createWorkoutSession);
router.get('/history', getWorkoutHistory);
router.delete('/:id', deleteWorkoutSession);
router.put('/:id', updateWorkoutSession);

export default router;