"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProfileAccent = "coach" | "client";

const heroGradient: Record<ProfileAccent, string> = {
  coach:
    "bg-gradient-to-br from-orange-500/[0.12] via-card to-teal-500/[0.06]",
  client:
    "bg-gradient-to-br from-teal-500/[0.1] via-card to-violet-500/[0.05]",
};

const roleBadge: Record<ProfileAccent, string> = {
  coach: "bg-orange-500/10 text-orange-700 ring-orange-500/20",
  client: "bg-violet-500/10 text-violet-700 ring-violet-500/20",
};

export function ProfilePageHeader({
  title,
  description,
  accent = "coach",
}: {
  title: string;
  description: string;
  accent?: ProfileAccent;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-balance text-xl font-bold tracking-tight min-[400px]:text-2xl">
          {title}
        </h1>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset",
            roleBadge[accent],
          )}
        >
          <Sparkles className="size-3" aria-hidden />
          {accent === "coach" ? "Coach profile" : "Client profile"}
        </span>
      </div>
      <p className="max-w-2xl text-sm font-medium leading-snug text-muted-foreground/85">
        {description}
      </p>
    </div>
  );
}

export function ProfileHeroBanner({
  displayName,
  email,
  roleLabel,
  accent = "coach",
  children,
}: {
  displayName: string;
  email: string;
  roleLabel: string;
  accent?: ProfileAccent;
  children?: ReactNode;
}) {
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("border-b border-border/30 px-5 pb-6 pt-6 sm:px-6", heroGradient[accent])}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-20 border-0 shadow-md ring-2 ring-white/80 sm:size-24">
          <AvatarFallback className="text-lg font-bold sm:text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xl font-bold tracking-tight text-foreground">{displayName}</p>
          <p className="text-sm font-medium text-muted-foreground/85">{email}</p>
          <span
            className={cn(
              "inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
              roleBadge[accent],
            )}
          >
            {roleLabel}
          </span>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function ProfileMainCard({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-card shadow-lg shadow-black/[0.04]">
      {children}
    </Card>
  );
}

export function ProfileFormCard({ children }: { children: ReactNode }) {
  return <CardContent className="space-y-6 px-5 pb-6 pt-6 sm:px-6">{children}</CardContent>;
}

export type QuickLink = { href: string; label: string };

export function ProfileQuickLinks({
  links,
  hint,
}: {
  links: QuickLink[];
  hint?: string;
}) {
  return (
    <aside className="min-w-0 space-y-4">
      <Card className="rounded-2xl border-0 bg-muted/25 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Quick links</CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground/80">
            Workspace shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0.5 pb-4">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              className="justify-start rounded-xl font-medium text-foreground/90 hover:bg-background/80"
              asChild
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
      {hint ? (
        <p className="px-1 text-xs font-medium leading-relaxed text-muted-foreground/80">
          {hint}
        </p>
      ) : null}
    </aside>
  );
}

export function ProfilePageGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_17rem] lg:items-start lg:gap-8">
      {children}
    </div>
  );
}
