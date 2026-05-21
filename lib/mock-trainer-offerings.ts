export type TrainerOfferingKind = "1on1" | "group" | "online";
export type TrainerOffering = {
    id: string;
    title: string;
    description: string;
    durationMin: number;
    priceLabel: string;
    maxParticipants: number;
    kind: TrainerOfferingKind;
};
export function getTrainerOfferings(): TrainerOffering[] {
    return [
        {
            id: "of-1on1",
            title: "1-on-1 training",
            description: "Private session — form coaching, progression, and accountability.",
            durationMin: 60,
            priceLabel: "From €45",
            maxParticipants: 1,
            kind: "1on1",
        },
        {
            id: "of-group",
            title: "Group training",
            description: "Small group strength or HIIT — scalable for mixed levels.",
            durationMin: 50,
            priceLabel: "From €18",
            maxParticipants: 10,
            kind: "group",
        },
        {
            id: "of-online",
            title: "Online coaching",
            description: "Video check-in, program tweaks, and habit support between sessions.",
            durationMin: 45,
            priceLabel: "From €32",
            maxParticipants: 1,
            kind: "online",
        },
    ];
}
export function offeringLabel(o: TrainerOffering) {
    return `${o.title} · ${o.durationMin} min · ${o.priceLabel}`;
}
