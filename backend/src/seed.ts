// Auteur : Noa Gaillard

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.workoutExercise.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.exerciseMuscle.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.muscle.deleteMany();
    await prisma.user.deleteMany();
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: {
            email: 'test@heattrainer.com',
            password: hashedPassword,
            name: 'Utilisateur Test'
        }
    });

    const musclesData = [
        "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps",
        "Quadriceps", "Ischios", "Mollets", "Fessiers", "Lombaires", "Abdominaux"
    ];

    const muscleMap: Record<string, string> = {};
    for (const mName of musclesData) {
        const m = await prisma.muscle.create({ data: { name: mName } });
        muscleMap[mName] = m.id;
    }

    const exercises = [
        { name: "Développé couché", muscles: [ { name: "Pectoraux", coef: 1.0 }, { name: "Triceps", coef: 0.6 }, { name: "Épaules", coef: 0.4 } ] },
        { name: "Développé incliné", muscles: [ { name: "Pectoraux", coef: 1.0 }, { name: "Épaules", coef: 0.7 }, { name: "Triceps", coef: 0.5 } ] },
        { name: "Développé décliné", muscles: [ { name: "Pectoraux", coef: 1.0 }, { name: "Triceps", coef: 0.5 } ] },
        { name: "Écartés haltères", muscles: [ { name: "Pectoraux", coef: 1.0 }, { name: "Épaules", coef: 0.3 } ] },
        { name: "Écartés poulies", muscles: [ { name: "Pectoraux", coef: 1.0 } ] },
        { name: "Pec-deck", muscles: [ { name: "Pectoraux", coef: 1.0 } ] },
        { name: "Pompes", muscles: [ { name: "Pectoraux", coef: 0.8 }, { name: "Triceps", coef: 0.6 }, { name: "Abdominaux", coef: 0.3 } ] },
        { name: "Tractions", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.7 } ] },
        { name: "Rowing", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.5 }, { name: "Lombaires", coef: 0.4 } ] },
        { name: "Soulevé de terre", muscles: [ { name: "Dos", coef: 0.8 }, { name: "Lombaires", coef: 1.0 }, { name: "Fessiers", coef: 0.8 }, { name: "Ischios", coef: 0.7 } ] },
        { name: "Shrugs", muscles: [ { name: "Dos", coef: 0.8 }, { name: "Épaules", coef: 0.5 } ] },
        { name: "Tirage vertical", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.6 } ] },
        { name: "Tirage horizontal", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.5 } ] },
        { name: "Extension lombaire", muscles: [ { name: "Lombaires", coef: 1.0 } ] },
        { name: "Pullover", muscles: [ { name: "Dos", coef: 0.7 }, { name: "Pectoraux", coef: 0.5 } ] },
        { name: "Shrug incliné haltères", muscles: [ { name: "Dos", coef: 0.9 } ] },
        { name: "Rowing barre T", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.4 } ] },
        { name: "Rowing haltère", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.4 } ] },
        { name: "Tirage horizontal haut", muscles: [ { name: "Dos", coef: 0.9 }, { name: "Épaules", coef: 0.5 } ] },
        { name: "Rowing deux haltères", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Lombaires", coef: 0.5 } ] },
        { name: "Extension couché", muscles: [ { name: "Triceps", coef: 1.0 } ] },
        { name: "Développé épaules", muscles: [ { name: "Épaules", coef: 1.0 }, { name: "Triceps", coef: 0.6 } ] },
        { name: "Élévation latérale", muscles: [ { name: "Épaules", coef: 1.0 } ] },
        { name: "Élévation frontale", muscles: [ { name: "Épaules", coef: 1.0 } ] },
        { name: "Élévation buste penché", muscles: [ { name: "Épaules", coef: 0.9 }, { name: "Dos", coef: 0.4 } ] },
        { name: "Tirage menton", muscles: [ { name: "Épaules", coef: 1.0 }, { name: "Dos", coef: 0.6 } ] },
        { name: "Rowing assis", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Épaules", coef: 0.4 } ] },
        { name: "Oiseau à la poulie", muscles: [ { name: "Épaules", coef: 1.0 } ] },
        { name: "Élévations frontales incliné", muscles: [ { name: "Épaules", coef: 1.0 } ] },
        { name: "Crunch", muscles: [ { name: "Abdominaux", coef: 1.0 } ] },
        { name: "Crunch à la poulie", muscles: [ { name: "Abdominaux", coef: 1.0 } ] },
        { name: "Gainage", muscles: [ { name: "Abdominaux", coef: 1.0 }, { name: "Lombaires", coef: 0.6 } ] },
        { name: "Relevés de jambes", muscles: [ { name: "Abdominaux", coef: 1.0 } ] },
        { name: "Flexions latérales", muscles: [ { name: "Abdominaux", coef: 0.8 } ] },
        { name: "Rotation avec bâton", muscles: [ { name: "Abdominaux", coef: 0.7 } ] },
        { name: "Squat", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.8 }, { name: "Lombaires", coef: 0.5 } ] },
        { name: "Leg extension", muscles: [ { name: "Quadriceps", coef: 1.0 } ] },
        { name: "Hack squat", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.6 } ] },
        { name: "Presse à cuisse", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.7 } ] },
        { name: "Squat barre guidée", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.7 } ] },
        { name: "Montée sur banc", muscles: [ { name: "Quadriceps", coef: 0.8 }, { name: "Fessiers", coef: 1.0 } ] },
        { name: "Sissy squat", muscles: [ { name: "Quadriceps", coef: 1.0 } ] },
        { name: "Soulevé de terre jambes tendues", muscles: [ { name: "Ischios", coef: 1.0 }, { name: "Lombaires", coef: 0.8 }, { name: "Fessiers", coef: 0.7 } ] },
        { name: "Leg curl debout", muscles: [ { name: "Ischios", coef: 1.0 } ] },
        { name: "Good morning", muscles: [ { name: "Lombaires", coef: 1.0 }, { name: "Ischios", coef: 0.8 } ] },
        { name: "Leg curl assis", muscles: [ { name: "Ischios", coef: 1.0 } ] },
        { name: "Fentes", muscles: [ { name: "Quadriceps", coef: 0.8 }, { name: "Fessiers", coef: 1.0 } ] },
        { name: "Mollets à la presse", muscles: [ { name: "Mollets", coef: 1.0 } ] },
        { name: "Élévation à 45°", muscles: [ { name: "Mollets", coef: 1.0 } ] },
        { name: "Mollets assis", muscles: [ { name: "Mollets", coef: 1.0 } ] },
        { name: "Mollets debout", muscles: [ { name: "Mollets", coef: 1.0 } ] },
        { name: "Flexion aux haltères", muscles: [ { name: "Biceps", coef: 1.0 } ] },
        { name: "Flexion barre pronation", muscles: [ { name: "Biceps", coef: 0.8 } ] },
        { name: "Flexion barre supination", muscles: [ { name: "Biceps", coef: 1.0 } ] },
        { name: "Squat bulgare", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.8 } ] },
        { name: "Front squat", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Lombaires", coef: 0.6 } ] },
        { name: "Hip thrust", muscles: [ { name: "Fessiers", coef: 1.0 }, { name: "Ischios", coef: 0.5 } ] },
        { name: "Tirage poulie haute bras tendus", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Triceps", coef: 0.4 } ] },
        { name: "Curl marteau", muscles: [ { name: "Biceps", coef: 1.0 } ] },
        { name: "Curl pupitre", muscles: [ { name: "Biceps", coef: 1.0 } ] },
        { name: "Triceps poulie haute", muscles: [ { name: "Triceps", coef: 1.0 } ] },
        { name: "Dips", muscles: [ { name: "Triceps", coef: 1.0 }, { name: "Pectoraux", coef: 0.8 }, { name: "Épaules", coef: 0.5 } ] },
        { name: "Extension triceps à la corde", muscles: [ { name: "Triceps", coef: 1.0 } ] },
        { name: "Machine pectoraux convergente", muscles: [ { name: "Pectoraux", coef: 1.0 }, { name: "Triceps", coef: 0.4 } ] },
        { name: "Face pull", muscles: [ { name: "Épaules", coef: 1.0 }, { name: "Dos", coef: 0.5 } ] },
        { name: "Russian twist", muscles: [ { name: "Abdominaux", coef: 1.0 } ] },
        { name: "Ab wheel", muscles: [ { name: "Abdominaux", coef: 1.0 }, { name: "Lombaires", coef: 0.4 } ] },
        { name: "Soulevé de terre sumo", muscles: [ { name: "Fessiers", coef: 1.0 }, { name: "Quadriceps", coef: 0.8 }, { name: "Dos", coef: 0.6 } ] },
        { name: "Goblet squat", muscles: [ { name: "Quadriceps", coef: 1.0 }, { name: "Fessiers", coef: 0.7 } ] },
        { name: "Élévations latérales poulie", muscles: [ { name: "Épaules", coef: 1.0 } ] },
        { name: "Muscle up", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Triceps", coef: 0.8 }, { name: "Pectoraux", coef: 0.5 }, { name: "Abdominaux", coef: 0.4 } ] },
        { name: "Tirage poitrine", muscles: [ { name: "Dos", coef: 1.0 }, { name: "Biceps", coef: 0.6 } ] }
    ];

    for (const ex of exercises) {
        await prisma.exercise.create({
            data: {
                name: ex.name,
                type: 'Musculation',
                muscles: {
                    create: ex.muscles.map(m => ({
                        muscleId: muscleMap[m.name],
                        activationCoefficient: m.coef
                    }))
                }
            }
        });
    }

    console.log("Database seeded with structured exercises.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });