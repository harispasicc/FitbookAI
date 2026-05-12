import type { CoachBestForLabel, CoachSpecialization } from "@/lib/coach-specializations";
export type DeliveryMode = "online" | "in_person" | "hybrid";
export type CoachServiceCard = {
    id: string;
    title: string;
    price: string;
    blurb: string;
    durationMin: number;
};
export type CoachReview = {
    id: string;
    author: string;
    rating: number;
    text: string;
    dateLabel: string;
};
export type CoachTransformation = {
    headline: string;
    beforeLabel: string;
    afterLabel: string;
    metrics: {
        label: string;
        value: string;
    }[];
    testimonial: string;
    testimonialAuthor: string;
};
export type MockTrainer = {
    id: string;
    name: string;
    headline: string;
    bio: string;
    longBio: string;
    categories: string[];
    specializations: CoachSpecialization[];
    bestFor: CoachBestForLabel[];
    deliveryModes: DeliveryMode[];
    locationLabel: string;
    rating: number;
    reviewCount: number;
    priceFrom: string;
    avatarIndex: number;
    yearsExperience: number;
    clientsHelped: number;
    certifications: string[];
    languages: string[];
    sessionLengthsMin: number[];
    nextOpenSlots: string[];
    weeklyHours: [
        string,
        string,
        string,
        string,
        string,
        string,
        string
    ];
    services: CoachServiceCard[];
    reviews: CoachReview[];
    transformation?: CoachTransformation;
};
export const MOCK_TRAINERS: MockTrainer[] = [
    {
        id: "nina-k",
        name: "Nina Kovač",
        headline: "Yoga · Pilates · Mobility",
        bio: "Certified RYT-500. Breath-led flows and sustainable ranges for desk-bound professionals.",
        longBio: "Nina blends vinyasa flow with mobility drills and Pilates fundamentals so you build range without forcing positions. Sessions stay breath-led and adaptable — ideal if you sit at a desk and want sustainable movement. She tracks how you feel week to week and adjusts intensity so progress stays kind to your nervous system.",
        categories: ["Yoga", "Pilates", "Mobility"],
        specializations: ["Yoga", "Pilates", "Mobility & stretching", "Posture correction", "Busy professionals"],
        bestFor: ["Best for flexibility", "Best for busy professionals", "Best for mobility"],
        deliveryModes: ["hybrid", "online"],
        locationLabel: "Sarajevo · studio & online",
        rating: 4.9,
        reviewCount: 128,
        priceFrom: "€35",
        avatarIndex: 0,
        yearsExperience: 8,
        clientsHelped: 420,
        certifications: ["RYT-500", "FMS Level 1", "First aid"],
        languages: ["English", "Bosnian"],
        sessionLengthsMin: [45, 60],
        nextOpenSlots: ["Tue 7:30", "Wed 12:00", "Thu 18:15", "Sat 10:00"],
        weeklyHours: ["12–20", "09–20", "09–20", "09–20", "09–18", "10–14", "Off"],
        services: [
            { id: "n1", title: "Private yoga", price: "€45", blurb: "60 min · alignment & breath", durationMin: 60 },
            { id: "n2", title: "Pilates fundamentals", price: "€40", blurb: "50 min · core & control", durationMin: 50 },
            { id: "n3", title: "Mobility reset", price: "€35", blurb: "45 min · hips & shoulders", durationMin: 45 },
        ],
        reviews: [
            {
                id: "nr1",
                author: "Maja P.",
                rating: 5,
                text: "Finally a coach who explains why a pose matters — my lower back feels better after three weeks.",
                dateLabel: "Mar 2026",
            },
            {
                id: "nr2",
                author: "Chris L.",
                rating: 5,
                text: "Online sessions are structured like in-studio. Calm cues, no chaos.",
                dateLabel: "Feb 2026",
            },
        ],
        transformation: {
            headline: "Client spotlight — mobility path",
            beforeLabel: "Week 1 · desk stiffness",
            afterLabel: "Week 10 · overhead comfort",
            metrics: [
                { label: "Shoulder flexion", value: "+18°" },
                { label: "Session consistency", value: "9 / 10 weeks" },
            ],
            testimonial: "I did not think ‘gentle’ could feel this effective. Nina’s progressions made sense every week.",
            testimonialAuthor: "Emina, 34",
        },
    },
    {
        id: "marcus-t",
        name: "Marcus Torres",
        headline: "CrossFit · Athletic performance · Conditioning",
        bio: "Former collegiate S&C. Clear progressions for athletes who want measurable conditioning.",
        longBio: "Marcus maps strength and conditioning to your sport calendar — whether that’s a heavier clean or repeat sprint quality. Blocks include warm-ups, main work, and accessories; RPE and volume are tracked so you see trends. Ideal if you like team energy but want a coach who obsesses over positions and recovery.",
        categories: ["CrossFit", "Strength", "Conditioning"],
        specializations: ["CrossFit", "Athletic performance", "Cardio conditioning", "Strength training", "HIIT"],
        bestFor: ["Best for athletes", "Best for strength", "Best for busy professionals"],
        deliveryModes: ["in_person", "hybrid"],
        locationLabel: "Sarajevo · gym floor & track",
        rating: 4.8,
        reviewCount: 94,
        priceFrom: "€45",
        avatarIndex: 1,
        yearsExperience: 11,
        clientsHelped: 310,
        certifications: ["CSCS", "USAW L1", "CPR"],
        languages: ["English", "Spanish"],
        sessionLengthsMin: [60, 90],
        nextOpenSlots: ["Mon 17:00", "Wed 19:00", "Fri 07:00", "Sun 11:30"],
        weeklyHours: ["16–21", "16–21", "16–21", "16–21", "16–20", "09–13", "Off"],
        services: [
            { id: "m1", title: "Athlete S&C block", price: "€65", blurb: "75 min · periodized", durationMin: 75 },
            { id: "m2", title: "CrossFit skill hour", price: "€48", blurb: "60 min · barbell + engine", durationMin: 60 },
            { id: "m3", title: "Conditioning lab", price: "€42", blurb: "50 min · zones & repeats", durationMin: 50 },
        ],
        reviews: [
            {
                id: "mr1",
                author: "Damir V.",
                rating: 5,
                text: "Structured without being robotic — PRs went up and niggles went down.",
                dateLabel: "Apr 2026",
            },
            {
                id: "mr2",
                author: "Team Falcon U18",
                rating: 5,
                text: "Marcus speaks the language of both coaches and parents. Clear reporting.",
                dateLabel: "Jan 2026",
            },
        ],
        transformation: {
            headline: "Off-season recomposition",
            beforeLabel: "Baseline testing",
            afterLabel: "Week 12 retest",
            metrics: [
                { label: "Vertical jump", value: "+6 cm" },
                { label: "500m row", value: "−12 s" },
            ],
            testimonial: "We saw the shift in repeat sprint quality before the scale moved — exactly what we needed mid-season.",
            testimonialAuthor: "Coach Amir",
        },
    },
    {
        id: "emma-r",
        name: "Emma Rodriguez",
        headline: "Weight loss · Beginner fitness · HIIT",
        bio: "Habit-first coaching — sustainable fat loss without crash diets or shame.",
        longBio: "Emma builds weeks around consistency: two strength days, two conditioning days, and one recovery walk. Nutrition is habits over spreadsheets — protein anchors, simple meal templates, and sleep hygiene. Perfect if you are restarting after time off or juggling a demanding job.",
        categories: ["HIIT", "Weight loss", "Beginners"],
        specializations: ["Weight loss", "Beginner fitness", "HIIT", "Functional fitness", "Nutrition habits", "Busy professionals"],
        bestFor: ["Best for beginners", "Best for fat loss", "Best for busy professionals"],
        deliveryModes: ["online", "hybrid"],
        locationLabel: "Remote-first · monthly studio check-in",
        rating: 4.85,
        reviewCount: 112,
        priceFrom: "€30",
        avatarIndex: 2,
        yearsExperience: 6,
        clientsHelped: 265,
        certifications: ["NASM CPT", "Precision Nutrition L1"],
        languages: ["English", "Spanish"],
        sessionLengthsMin: [40, 55],
        nextOpenSlots: ["Mon 06:00", "Tue 19:30", "Thu 06:00", "Sat 08:00"],
        weeklyHours: ["06–09", "17–21", "06–09", "17–21", "06–09", "08–12", "Off"],
        services: [
            { id: "e1", title: "Starter 4-week block", price: "€120", blurb: "3× sessions / week template", durationMin: 40 },
            { id: "e2", title: "HIIT + habits check-in", price: "€38", blurb: "45 min · zones + steps", durationMin: 45 },
            { id: "e3", title: "Monthly accountability", price: "€85", blurb: "4 video reviews + plan tweaks", durationMin: 30 },
        ],
        reviews: [
            {
                id: "er1",
                author: "Sara K.",
                rating: 5,
                text: "I never stuck with anything before. Emma’s pacing made week three feel doable.",
                dateLabel: "Mar 2026",
            },
            {
                id: "er2",
                author: "Jonas M.",
                rating: 4,
                text: "Direct feedback without judgment — the habit tracker actually helped.",
                dateLabel: "Feb 2026",
            },
        ],
        transformation: {
            headline: "Sustainable fat loss arc",
            beforeLabel: "Week 0",
            afterLabel: "Week 16",
            metrics: [
                { label: "Waist", value: "−6 cm" },
                { label: "Weekly workouts", value: "2 → 4" },
            ],
            testimonial: "Energy came back before the scale moved — that kept me motivated.",
            testimonialAuthor: "Lejla, 41",
        },
    },
    {
        id: "alex-c",
        name: "Alex Chen",
        headline: "Muscle building · Strength · Nutrition habits",
        bio: "Hypertrophy blocks with honest volume prescriptions and simple nutrition anchors.",
        longBio: "Alex programs in mesocycles — accumulation, intensification, deload — with clear rep targets and proximity to failure. Nutrition stays minimal: protein targets, meal templates, and a weekly photo check if you want it. Great if you have gym access and like tracking numbers without living in spreadsheets.",
        categories: ["Strength", "Muscle", "Nutrition"],
        specializations: ["Muscle building", "Strength training", "Bodybuilding", "Nutrition habits", "Powerlifting"],
        bestFor: ["Best for strength", "Best for busy professionals"],
        deliveryModes: ["in_person", "online"],
        locationLabel: "Sarajevo · private gym suite",
        rating: 4.92,
        reviewCount: 156,
        priceFrom: "€50",
        avatarIndex: 3,
        yearsExperience: 9,
        clientsHelped: 340,
        certifications: ["NSCA CSCS", "ISSN-SNS"],
        languages: ["English", "Mandarin"],
        sessionLengthsMin: [60, 75],
        nextOpenSlots: ["Tue 18:00", "Wed 12:30", "Fri 17:30", "Sun 10:30"],
        weeklyHours: ["Off", "16–21", "10–14", "16–21", "16–21", "09–13", "10–14"],
        services: [
            { id: "a1", title: "Hypertrophy block", price: "€58", blurb: "60 min · upper/lower split", durationMin: 60 },
            { id: "a2", title: "Strength peaking", price: "€70", blurb: "75 min · SBD focus", durationMin: 75 },
            { id: "a3", title: "Nutrition add-on", price: "€25", blurb: "30 min · weekly check-in", durationMin: 30 },
        ],
        reviews: [
            {
                id: "ar1",
                author: "Igor N.",
                rating: 5,
                text: "Programs are dense but readable — I always know why the volume changed.",
                dateLabel: "Apr 2026",
            },
            {
                id: "ar2",
                author: "Lea T.",
                rating: 5,
                text: "Best coach I have had for compound lifts. Patient with technique.",
                dateLabel: "Mar 2026",
            },
        ],
    },
    {
        id: "leo-h",
        name: "Leo Hansen",
        headline: "CrossFit L2 · scalable metcons",
        bio: "Mechanics-first intensity — scaling options every session so the room moves together.",
        longBio: "Leo prioritizes mechanics before intensity — skill progressions on lifts and gymnastics alongside classic metcons. Expect clear scaling options every day so the room moves together. Ideal if you like community energy but want a coach who obsesses over safe positions.",
        categories: ["CrossFit", "Strength"],
        specializations: ["CrossFit", "HIIT", "Calisthenics", "Strength training"],
        bestFor: ["Best for athletes", "Best for strength"],
        deliveryModes: ["in_person"],
        locationLabel: "Sarajevo · CrossFit box",
        rating: 4.9,
        reviewCount: 203,
        priceFrom: "€40",
        avatarIndex: 4,
        yearsExperience: 9,
        clientsHelped: 580,
        certifications: ["CrossFit L2", "CPR/AED"],
        languages: ["English", "Danish"],
        sessionLengthsMin: [60],
        nextOpenSlots: ["Mon 16:00", "Tue 16:00", "Thu 16:00", "Sat 11:00"],
        weeklyHours: ["15–20", "15–20", "15–20", "15–20", "15–19", "10–13", "Off"],
        services: [
            { id: "l1", title: "Drop-in WOD", price: "€22", blurb: "60 min · class pass", durationMin: 60 },
            { id: "l2", title: "Skill session", price: "€45", blurb: "45 min · muscle-up / snatch", durationMin: 45 },
        ],
        reviews: [
            {
                id: "lr1",
                author: "Ana B.",
                rating: 5,
                text: "Scaling is never an afterthought — I know what success looks like each day.",
                dateLabel: "Feb 2026",
            },
        ],
    },
    {
        id: "sofia-r",
        name: "Sofia Rossi",
        headline: "Definition · habits · sustainable energy",
        bio: "Resistance training plus small repeatable nutrition habits — no crash-diet culture.",
        longBio: "Sofia pairs resistance training with small, repeatable nutrition habits — protein targets, meal timing, and sleep cues — without shame or crash diets. Good if you want definition and energy for daily life, not just a photoshoot peak. Progress photos optional and private by default.",
        categories: ["Definition", "Strength", "Fitness"],
        specializations: ["Body recomposition", "Strength training", "Nutrition habits", "Weight loss", "Functional fitness"],
        bestFor: ["Best for fat loss", "Best for busy professionals"],
        deliveryModes: ["hybrid"],
        locationLabel: "Sarajevo · studio + app check-ins",
        rating: 4.8,
        reviewCount: 61,
        priceFrom: "€38",
        avatarIndex: 5,
        yearsExperience: 7,
        clientsHelped: 240,
        certifications: ["ISSN-SNS", "NASM CPT"],
        languages: ["English", "Italian"],
        sessionLengthsMin: [50, 60],
        nextOpenSlots: ["Wed 08:00", "Wed 17:30", "Fri 08:00", "Sun 17:00"],
        weeklyHours: ["08–12", "16–20", "08–12", "16–20", "08–12", "10–14", "16–19"],
        services: [
            { id: "s1", title: "Definition block", price: "€48", blurb: "60 min · lift + habits", durationMin: 60 },
            { id: "s2", title: "Nutrition reset", price: "€35", blurb: "45 min · templates", durationMin: 45 },
        ],
        reviews: [
            {
                id: "sr1",
                author: "Petra M.",
                rating: 5,
                text: "Finally someone who talks about sleep as much as macros.",
                dateLabel: "Jan 2026",
            },
        ],
    },
    {
        id: "dan-ok",
        name: "Dan Okonkwo",
        headline: "Hybrid athlete · run + lift + recover",
        bio: "Sprints, compounds, and recovery blocks for people who want variety without chaos.",
        longBio: "Dan builds hybrid weeks: short sprints, compound lifts, and dedicated recovery blocks. Suited if you get bored with pure lifting or pure running. Expect structured deloads and a coach who talks about sleep and steps as much as the barbell.",
        categories: ["Fitness", "Cardio", "Strength"],
        specializations: ["Running coach", "Strength training", "Cardio conditioning", "Functional fitness", "Injury prevention"],
        bestFor: ["Best for athletes", "Best for mobility"],
        deliveryModes: ["hybrid", "online"],
        locationLabel: "Sarajevo · track + remote programming",
        rating: 4.6,
        reviewCount: 52,
        priceFrom: "€36",
        avatarIndex: 2,
        yearsExperience: 5,
        clientsHelped: 160,
        certifications: ["NSCA CPT", "Running mechanics workshop"],
        languages: ["English"],
        sessionLengthsMin: [60],
        nextOpenSlots: ["Tue 07:00", "Thu 19:00", "Sat 08:30"],
        weeklyHours: ["07–10", "17–21", "07–10", "17–21", "07–10", "08–12", "Off"],
        services: [
            { id: "d1", title: "Hybrid week build", price: "€44", blurb: "60 min · plan + review", durationMin: 60 },
        ],
        reviews: [
            {
                id: "dr1",
                author: "Marko S.",
                rating: 5,
                text: "Keeps running and lifting in one coherent story — deloads actually happen.",
                dateLabel: "Dec 2025",
            },
        ],
    },
];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export function getTrainerById(id: string): MockTrainer | undefined {
    return MOCK_TRAINERS.find((t) => t.id === id);
}
export function trainerWeekdayRows(trainer: MockTrainer) {
    return weekdays.map((day, i) => ({ day, hours: trainer.weeklyHours[i] ?? "—" }));
}
