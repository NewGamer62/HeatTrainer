// Auteur : Noa Gaillard

import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import workoutRoutes from './routes/workout.routes';
import exerciseRoutes from './routes/exercise.routes';
import recommendationRoutes from './routes/recommendation.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
});
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/workouts', workoutRoutes);

app.get('/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'API is running', database: 'Connected' });
    } catch (error) {
        res.status(500).json({ status: 'API is running', database: 'Disconnected' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});