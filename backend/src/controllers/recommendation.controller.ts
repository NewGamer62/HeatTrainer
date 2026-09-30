// Auteur : Noa Gaillard

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const allMuscles = await prisma.muscle.findMany();
        const tensions: Record<string, number> = {};
        for (let i = 0; i < allMuscles.length; i++) {
            tensions[allMuscles[i].name] = 0;
        }

        const nowTime = new Date().getTime();
        const RECOVERY_TIME_HOURS = 72;
        const cutoffDate = new Date(nowTime - (RECOVERY_TIME_HOURS * 60 * 60 * 1000));

        const userSessions = await prisma.workoutSession.findMany({
            where: { 
                userId: userId,
                createdAt: { gte: cutoffDate }
            },
            include: {
                exercises: {
                    include: { exercise: { include: { muscles: { include: { muscle: true } } } } }
                }
            }
        });

        for (let i = 0; i < userSessions.length; i++) {
            const session = userSessions[i];
            const sessionTime = new Date(session.createdAt).getTime();
            const hoursPassed = (nowTime - sessionTime) / (1000 * 60 * 60);
            
            const retention = Math.max(0, 1 - (hoursPassed / RECOVERY_TIME_HOURS));

            if (retention > 0) {
                for (let j = 0; j < session.exercises.length; j++) {
                    const ex = session.exercises[j];
                    const baseIntensity = ex.sets * ex.reps * ex.weight;
                    const decayedIntensity = baseIntensity * retention;
                    
                    for (let k = 0; k < ex.exercise.muscles.length; k++) {
                        const muscleRel = ex.exercise.muscles[k];
                        const muscleName = muscleRel.muscle.name;
                        tensions[muscleName] += (decayedIntensity * muscleRel.activationCoefficient);
                    }
                }
            }
        }

        const coldMuscles = Object.keys(tensions).filter(name => tensions[name] < 500);

        let recommendations: any[] = [];
        if (coldMuscles.length > 0) {
            const potentialExercises = await prisma.exercise.findMany({
                where: {
                    muscles: {
                        some: {
                            muscle: { name: { in: coldMuscles } }
                        }
                    }
                },
                include: {
                    muscles: true
                }
            });

            const scoredExercises = potentialExercises.map(ex => {
                const totalIntensity = ex.muscles.reduce((sum, m) => sum + m.activationCoefficient, 0);
                return {
                    id: ex.id,
                    name: ex.name,
                    score: totalIntensity
                };
            });

            scoredExercises.sort((a, b) => b.score - a.score);
            recommendations = scoredExercises.slice(0, 3).map(ex => ({ id: ex.id, name: ex.name }));
        }

        res.status(200).json({ tensions, recommendations });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};