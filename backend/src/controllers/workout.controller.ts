// Auteur : Noa Gaillard

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createWorkoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { exercises } = req.body;

        const session = await prisma.workoutSession.create({
            data: {
                userId: userId,
                exercises: {
                    create: exercises.map((ex: any) => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight
                    }))
                }
            },
            include: {
                exercises: true
            }
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getWorkoutHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const history = await prisma.workoutSession.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                exercises: {
                    include: { exercise: true }
                }
            }
        });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteWorkoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const idString = Array.isArray(id) ? id[0] : id;

        await prisma.workoutExercise.deleteMany({
            where: { workoutSessionId: idString }
        });

        await prisma.workoutSession.delete({
            where: { id: idString }
        });
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateWorkoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { exercises } = req.body;
        const idString = Array.isArray(id) ? id[0] : id;

        await prisma.workoutExercise.deleteMany({
            where: { workoutSessionId: idString }
        });

        const updatedSession = await prisma.workoutSession.update({
            where: { id: idString },
            data: {
                exercises: {
                    create: exercises.map((ex: any) => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight
                    }))
                }
            },
            include: {
                exercises: {
                    include: { exercise: true }
                }
            }
        });

        res.status(200).json(updatedSession);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};