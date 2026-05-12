import type { BookingRow } from "@/lib/mock-bookings";
export type DemoClient = {
    id: string;
    name: string;
    goal: string;
    sessions: number;
    notes: string;
    lastSession: string;
    progressPct: number;
    nextSession: string;
    status: "active" | "paused" | "trial";
    weightKg?: number;
};
export type DemoService = {
    id: string;
    name: string;
    durationMin: number;
    priceUsd: number;
    mode: string;
    maxParticipants: number;
    active: boolean;
    description: string;
};
export type DemoAnalytics = {
    revenue30d: number;
    bookingsCount: number;
    activeClients: number;
    retentionPct: number;
    aiRemindersGenerated: number;
};
export type DemoState = {
    version: 1;
    bookings: BookingRow[];
    clients: DemoClient[];
    services: DemoService[];
    analytics: DemoAnalytics;
};
