import type { SiteHeaderNavLink } from "@/components/site/site-header-nav";

export const CLIENT_LOGIN_PATH = "/login";
export const CLIENT_DEMO_LOGIN_PATH = "/login?demo=1";
export const TRAINER_LOGIN_PATH = "/trainer/login";
export const TRAINER_DEMO_LOGIN_PATH = "/trainer/login?demo=1";

export const GUEST_NAV_LINKS: SiteHeaderNavLink[] = [
  { href: "/coaches", label: "Find coaches" },
  { href: "/pricing", label: "How it works" },
  { href: CLIENT_DEMO_LOGIN_PATH, label: "Demo" },
  { href: CLIENT_LOGIN_PATH, label: "Sign in", variant: "primary" },
];
