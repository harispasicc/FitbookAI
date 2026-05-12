export type CoachPricingTier = {
    name: string;
    price: string;
    blurb: string;
    items: string[];
    cta: string;
    href: string;
    featured: boolean;
};
export const COACH_PRICING_TIERS: CoachPricingTier[] = [
    {
        name: "Free",
        price: "$0",
        blurb: "For solo coaches getting started.",
        items: ["Up to 20 clients", "Basic calendar", "Email reminders"],
        cta: "Start free",
        href: "/signup?intent=trainer",
        featured: false,
    },
    {
        name: "Pro",
        price: "$29",
        blurb: "Everything you need to run a serious practice.",
        items: ["Unlimited clients", "Advanced calendar", "SMS reminders", "Analytics"],
        cta: "Start trial",
        href: "/signup?intent=trainer",
        featured: true,
    },
    {
        name: "AI Pro",
        price: "$59",
        blurb: "AI workflows that save hours every week.",
        items: ["Everything in Pro", "AI scheduling", "AI meal & plan drafts", "Priority support"],
        cta: "Get AI Pro",
        href: "/signup?intent=trainer",
        featured: false,
    },
];
