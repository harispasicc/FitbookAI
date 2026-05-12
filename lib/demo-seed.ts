import type { BookingRow } from "@/lib/mock-bookings";
import type { DemoClient, DemoService, DemoState } from "@/lib/demo-types";
function fmtMoney(n: number) {
    return `$${n.toLocaleString("en-US")}`;
}
function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}
function fmtDate(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function buildDemoState(now = new Date()): DemoState {
    const clients: DemoClient[] = [
        {
            id: "c1",
            name: "Alex Morgan",
            goal: "Fat loss",
            sessions: 14,
            notes: "Knee-friendly squat depth",
            lastSession: fmtDate(addDays(now, -2)),
            progressPct: 72,
            nextSession: fmtDate(addDays(now, 1)) + " · 18:00",
            status: "active",
            weightKg: 78.2,
        },
        {
            id: "c2",
            name: "Jordan Lee",
            goal: "Hypertrophy",
            sessions: 9,
            notes: "Prefers evenings",
            lastSession: fmtDate(addDays(now, -1)),
            progressPct: 54,
            nextSession: fmtDate(addDays(now, 2)) + " · 19:30",
            status: "active",
            weightKg: 82.0,
        },
        {
            id: "c3",
            name: "Sam Rivera",
            goal: "Mobility",
            sessions: 6,
            notes: "Traveling next month",
            lastSession: fmtDate(addDays(now, -4)),
            progressPct: 38,
            nextSession: "—",
            status: "paused",
            weightKg: 70.5,
        },
        {
            id: "c4",
            name: "Casey Wu",
            goal: "Strength",
            sessions: 11,
            notes: "Competition prep",
            lastSession: fmtDate(addDays(now, -3)),
            progressPct: 81,
            nextSession: fmtDate(addDays(now, 0)) + " · 07:30",
            status: "active",
            weightKg: 88.4,
        },
        {
            id: "c5",
            name: "Riley Brooks",
            goal: "General fitness",
            sessions: 4,
            notes: "Beginner",
            lastSession: fmtDate(addDays(now, -6)),
            progressPct: 22,
            nextSession: fmtDate(addDays(now, 3)) + " · 12:00",
            status: "trial",
            weightKg: 92.1,
        },
    ];
    const services: DemoService[] = [
        {
            id: "s1",
            name: "1-on-1 training",
            durationMin: 60,
            priceUsd: 90,
            mode: "In person",
            maxParticipants: 1,
            active: true,
            description: "Private floor coaching — strength, conditioning, or hybrid blocks tailored to you.",
        },
        {
            id: "s2",
            name: "Online coaching",
            durationMin: 45,
            priceUsd: 65,
            mode: "Video",
            maxParticipants: 1,
            active: true,
            description: "Remote check-ins, form review, and program adjustments over video.",
        },
        {
            id: "s3",
            name: "Group class",
            durationMin: 50,
            priceUsd: 25,
            mode: "Studio",
            maxParticipants: 12,
            active: true,
            description: "Small-group HIIT or strength — scalable for mixed levels.",
        },
    ];
    const guests = ["Alex Morgan", "Jordan Lee", "Sam Rivera", "Casey Wu", "Riley Brooks"];
    const svcLabels = ["Private studio — 60m", "Strength block", "HIIT", "Mobility reset", "Nutrition check-in"];
    const bookings: BookingRow[] = Array.from({ length: 10 }).map((_, i): BookingRow => {
        const dayOffset = i - 2;
        const d = addDays(now, dayOffset);
        d.setHours(9 + (i % 4) * 2, 30, 0, 0);
        const status: BookingRow["status"] = i % 5 === 0 ? "cancelled" : i % 3 === 0 ? "pending" : "confirmed";
        const amount = status === "cancelled" ? "$0" : fmtMoney(70 + i * 12);
        return {
            id: `BK-${1045 - i}`,
            guest: guests[i % guests.length]!,
            service: svcLabels[i % svcLabels.length]!,
            date: fmtDate(d),
            status,
            amount,
            slotIso: d.toISOString(),
            trainerId: "",
            clientEmail: "",
        };
    });
    const analytics = {
        revenue30d: 12480,
        bookingsCount: 186,
        activeClients: clients.length,
        retentionPct: 88,
        aiRemindersGenerated: 214,
    };
    return {
        version: 1,
        clients,
        services,
        bookings,
        analytics,
    };
}
