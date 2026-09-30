// Auteur : Noa Gaillard

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExercises = async (req: Request, res: Response): Promise<void> => {
    try {
        const exercises = await prisma.exercise.findMany({
            include: {
                muscles: {
                    include: {
                        muscle: true
                    }
                }
            }
        });
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};