export type BookingRow = {
    id: string;
    guest: string;
    service: string;
    date: string;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    amount: string;
    slotIso?: string;
    trainerId?: string;
    serviceId?: string;
    clientEmail?: string;
    hasReview?: boolean;
};
export const mockBookings: BookingRow[] = [
    {
        id: "BK-1042",
        guest: "Alex Morgan",
        service: "Private studio (2h)",
        date: "May 14, 2026",
        status: "confirmed",
        amount: "$180",
    },
    {
        id: "BK-1041",
        guest: "Jordan Lee",
        service: "Podcast block",
        date: "May 13, 2026",
        status: "pending",
        amount: "$95",
    },
    {
        id: "BK-1038",
        guest: "Sam Rivera",
        service: "Mixing session",
        date: "May 12, 2026",
        status: "confirmed",
        amount: "$220",
    },
    {
        id: "BK-1035",
        guest: "Casey Wu",
        service: "Rehearsal room",
        date: "May 11, 2026",
        status: "cancelled",
        amount: "$0",
    },
];
