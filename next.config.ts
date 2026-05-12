import type { NextConfig } from "next";
const nextConfig: NextConfig = {
    devIndicators: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
    },
    async redirects() {
        return [
            { source: "/demo", destination: "/signup", permanent: false },
            { source: "/dashboard/calendar", destination: "/calendar", permanent: true },
            { source: "/dashboard/clients", destination: "/clients", permanent: true },
            { source: "/dashboard/services", destination: "/services", permanent: true },
            { source: "/dashboard/analytics", destination: "/analytics", permanent: true },
            { source: "/dashboard/settings", destination: "/settings", permanent: true },
            { source: "/dashboard/ai", destination: "/ai", permanent: true },
            { source: "/dashboard/bookings", destination: "/calendar", permanent: true },
        ];
    },
};
export default nextConfig;
