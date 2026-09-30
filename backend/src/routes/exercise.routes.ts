// Auteur : Noa Gaillard

import { Router } from 'express';
import { getExercises } from '../controllers/exercise.controller';

const router = Router();

router.get('/', getExercises);

export default router;