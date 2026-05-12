export const COACH_SPECIALIZATIONS = [
    "Weight loss",
    "Muscle building",
    "Body recomposition",
    "Strength training",
    "Functional fitness",
    "Cardio conditioning",
    "CrossFit",
    "HIIT",
    "Calisthenics",
    "Powerlifting",
    "Bodybuilding",
    "Yoga",
    "Pilates",
    "Mobility & stretching",
    "Beginner fitness",
    "Busy professionals",
    "Home workouts",
    "Online coaching",
    "Athletic performance",
    "Running coach",
    "Football conditioning",
    "Basketball conditioning",
    "Rehab & recovery",
    "Injury prevention",
    "Posture correction",
    "Senior fitness",
    "Nutrition habits",
] as const;
export type CoachSpecialization = (typeof COACH_SPECIALIZATIONS)[number];
export const COACH_BEST_FOR_LABELS = [
    "Best for beginners",
    "Best for fat loss",
    "Best for strength",
    "Best for flexibility",
    "Best for mobility",
    "Best for busy professionals",
    "Best for home workouts",
    "Best for athletes",
] as const;
export type CoachBestForLabel = (typeof COACH_BEST_FOR_LABELS)[number];
export const SPECIALIZATION_GROUPS = [
    {
        title: "General fitness",
        items: [
            "Weight loss",
            "Muscle building",
            "Body recomposition",
            "Strength training",
            "Functional fitness",
            "Cardio conditioning",
        ],
    },
    {
        title: "Popular niche",
        items: ["CrossFit", "HIIT", "Calisthenics", "Powerlifting", "Bodybuilding", "Yoga", "Pilates", "Mobility & stretching"],
    },
    {
        title: "Lifestyle",
        items: ["Beginner fitness", "Busy professionals", "Home workouts", "Online coaching"],
    },
    {
        title: "Performance",
        items: ["Athletic performance", "Running coach", "Football conditioning", "Basketball conditioning"],
    },
    {
        title: "Recovery & wellness",
        items: ["Rehab & recovery", "Injury prevention", "Posture correction", "Senior fitness"],
    },
    { title: "Habits", items: ["Nutrition habits"] },
] as const satisfies ReadonlyArray<{
    title: string;
    items: readonly string[];
}>;
export function isValidSpecialization(s: string): s is CoachSpecialization {
    return (COACH_SPECIALIZATIONS as readonly string[]).includes(s);
}
