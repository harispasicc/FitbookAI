export type ClientNotification = {
    id: string;
    title: string;
    body: string;
    timeLabel: string;
    tone: "info" | "success" | "warning" | "neutral";
    read?: boolean;
};
export const DEFAULT_CLIENT_NOTIFICATIONS: ClientNotification[] = [
    {
        id: "n1",
        title: "Session tomorrow",
        body: "Lower-body strength at 18:00. Bring lifting shoes if you have them.",
        timeLabel: "2h ago",
        tone: "info",
    },
    {
        id: "n2",
        title: "New plan uploaded",
        body: "Your trainer added Week 4 conditioning blocks to your program.",
        timeLabel: "Yesterday",
        tone: "success",
    },
    {
        id: "n3",
        title: "Attendance reminder",
        body: "You missed 2 sessions this month. Want to reschedule?",
        timeLabel: "Mon",
        tone: "warning",
    },
    {
        id: "n4",
        title: "Workout assigned",
        body: "Tempo squats + bike intervals, estimated 52 min.",
        timeLabel: "Sun",
        tone: "neutral",
    },
];
export type WorkoutHistoryRow = {
    id: string;
    date: string;
    type: string;
    durationMin: number;
    calories: number;
    trainerNote: string;
};
export const MOCK_WORKOUT_HISTORY: WorkoutHistoryRow[] = [
    {
        id: "w1",
        date: "May 9, 2026",
        type: "Lower strength",
        durationMin: 58,
        calories: 412,
        trainerNote: "Depth looked solid. Add 2.5kg next week if RPE stays ≤8.",
    },
    {
        id: "w2",
        date: "May 7, 2026",
        type: "Conditioning",
        durationMin: 42,
        calories: 498,
        trainerNote: "Hold 85% on the bike. Great pacing in round 3.",
    },
    {
        id: "w3",
        date: "May 4, 2026",
        type: "Mobility + core",
        durationMin: 35,
        calories: 180,
        trainerNote: "Hip capsule work 2× weekly until next check-in.",
    },
    {
        id: "w4",
        date: "May 1, 2026",
        type: "Upper hypertrophy",
        durationMin: 55,
        calories: 360,
        trainerNote: "Keep elbows 30–45° on presses. Shoulders stayed quiet.",
    },
];
