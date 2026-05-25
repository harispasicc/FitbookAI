export type LandingPreviewKpi = {
  label: string;
  value: string;
  series: readonly number[];
  sparkId: string;
  color: string;
};

export type LandingSocialProofStat = {
  value: string;
  label: string;
};

export const landingSocialProofStats: readonly LandingSocialProofStat[] = [
  { value: "12", label: "Coaches in the demo directory" },
  { value: "34", label: "Typical bookings per coach (30d)" },
  { value: "73%", label: "Repeat-client rate (illustration)" },
];

export const LANDING_PREVIEW_CAPTION =
  "Illustrative example · typical solo coach · not live data";

export const landingPreviewKpis: readonly LandingPreviewKpi[] = [
  {
    label: "Revenue (30d)",
    value: "€2,847",
    series: [2180, 2310, 2390, 2510, 2620, 2710, 2780, 2847],
    sparkId: "revenue",
    color: "#0d9488",
  },
  {
    label: "Bookings",
    value: "34",
    series: [4, 5, 4, 6, 5, 5, 4, 5],
    sparkId: "bookings",
    color: "#f97316",
  },
  {
    label: "Retention",
    value: "73%",
    series: [65, 67, 68, 69, 70, 71, 72, 73],
    sparkId: "retention",
    color: "#14b8a6",
  },
];

export const landingPreviewWeeklySessions = [5, 7, 6, 8, 7, 4, 3] as const;

export const landingPreviewWeeklyRevenueEur = [
  580, 640, 710, 690, 760, 820, 880, 920,
] as const;
