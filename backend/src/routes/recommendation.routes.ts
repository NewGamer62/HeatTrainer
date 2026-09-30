// Auteur : Noa Gaillard

import { Router } from 'express';
import { getDashboardData } from '../controllers/recommendation.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getDashboardData);

export default router;