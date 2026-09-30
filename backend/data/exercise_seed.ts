// Auteur : Noa Gaillard

export const exercisesData = [
    {
        name: "Pompes Classiques",
        type: "Bodyweight",
        muscleActivations: [
            { muscleId: "chest_mid", coefficient: 0.8 },
            { muscleId: "chest_lower", coefficient: 0.6 },
            { muscleId: "delt_front", coefficient: 0.5 },
            { muscleId: "triceps_lateral", coefficient: 0.7 },
            { muscleId: "abs_upper", coefficient: 0.2 }
        ]
    },
    {
        name: "Pompes Inclinées (Pieds surélevés)",
        type: "Bodyweight",
        muscleActivations: [
            { muscleId: "chest_upper", coefficient: 0.9 },
            { muscleId: "delt_front", coefficient: 0.8 },
            { muscleId: "triceps_lateral", coefficient: 0.6 }
        ]
    },
    {
        name: "Handstand Push-up (Mur)",
        type: "Bodyweight",
        muscleActivations: [
            { muscleId: "delt_front", coefficient: 1.0 },
            { muscleId: "delt_side", coefficient: 0.7 },
            { muscleId: "triceps_long", coefficient: 0.8 },
            { muscleId: "traps_upper", coefficient: 0.6 },
            { muscleId: "abs_lower", coefficient: 0.4 }
        ]
    }
];