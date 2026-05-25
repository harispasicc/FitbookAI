"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Globe, MapPin, Phone, Sparkles, User } from "lucide-react";
import { BusyDots, LoadingPlaceholder } from "@/components/ui/busy-dots";
import {
  ProfileFormCard,
  ProfileHeroBanner,
  ProfileMainCard,
  ProfilePageGrid,
  ProfilePageHeader,
  ProfileQuickLinks,
} from "@/components/dashboard/profile-page-shell";
import { useAuth } from "@/contexts/auth-context";
import {
  apiGetClientProfile,
  apiPatchClientProfile,
  profileDtoToExtension,
} from "@/lib/client-portal-api";
import {
  defaultClientProfileExtension,
  type ClientProfileExtension,
} from "@/lib/client-profile-extension";
import { notifyClientPortalUpdated } from "@/lib/demo-data-events";
import { deferEffect } from "@/lib/defer-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const timezones = [
  "Europe/Sarajevo",
  "Europe/Belgrade",
  "Europe/Zagreb",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const CLIENT_LINKS = [
  { href: "/me", label: "Home" },
  { href: "/me/sessions", label: "Sessions" },
  { href: "/me/progress", label: "Progress" },
  { href: "/coaches", label: "Find coaches" },
  { href: "/me/ai", label: "FitBook AI" },
];

export function ClientProfileView() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [ext, setExt] = useState<ClientProfileExtension>(defaultClientProfileExtension);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "client") {
      deferEffect(() => setLoading(false));
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const profile = await apiGetClientProfile();
        if (cancelled) return;
        setDisplayName(profile.fullName ?? user!.name);
        setExt(profileDtoToExtension(profile));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    deferEffect(() => void load());
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onSave = useCallback(async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    const result = await apiPatchClientProfile({
      fullName: displayName.trim() || undefined,
      headline: ext.headline,
      phone: ext.phone,
      city: ext.city,
      timezone: ext.timezone,
      bio: ext.bio,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    updateProfile({ name: result.profile.fullName ?? displayName });
    notifyClientPortalUpdated();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }, [user, displayName, ext, updateProfile]);

  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>;
  }

  if (loading) {
    return <LoadingPlaceholder minHeight="min-h-[12rem]" />;
  }

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ProfilePageHeader
        title="Profile"
        accent="client"
        description="How you appear in the workspace and what your coach may see in session notes and messaging."
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <ProfilePageGrid>
        <div className="min-w-0 space-y-6">
          <ProfileMainCard>
            <ProfileHeroBanner
              displayName={displayName || user.name}
              email={user.email}
              roleLabel={user.role}
              accent="client"
            />
            <ProfileFormCard>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-display-name" className="flex items-center gap-2">
                    <User className="size-3.5 text-muted-foreground" aria-hidden />
                    Display name
                  </Label>
                  <Input
                    id="client-display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 rounded-xl"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    value={user.email}
                    disabled
                    className="h-10 rounded-xl bg-muted/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-headline" className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-muted-foreground" aria-hidden />
                    Headline
                  </Label>
                  <Input
                    id="client-headline"
                    value={ext.headline}
                    onChange={(e) => setExt((x) => ({ ...x, headline: e.target.value }))}
                    placeholder="One line about your training focus"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone" className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                    Phone
                  </Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={ext.phone}
                    onChange={(e) => setExt((x) => ({ ...x, phone: e.target.value }))}
                    placeholder="+387 …"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-city" className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                    City / region
                  </Label>
                  <Input
                    id="client-city"
                    value={ext.city}
                    onChange={(e) => setExt((x) => ({ ...x, city: e.target.value }))}
                    placeholder="Sarajevo"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-tz" className="flex items-center gap-2">
                    <Globe className="size-3.5 text-muted-foreground" aria-hidden />
                    Timezone
                  </Label>
                  <select
                    id="client-tz"
                    value={ext.timezone}
                    onChange={(e) => setExt((x) => ({ ...x, timezone: e.target.value }))}
                    className="flex h-10 w-full max-w-md rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-bio">Bio</Label>
                  <textarea
                    id="client-bio"
                    value={ext.bio}
                    onChange={(e) => setExt((x) => ({ ...x, bio: e.target.value }))}
                    placeholder="Short note for your coach: goals, style, anything useful before sessions."
                    rows={4}
                    className="flex w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => void onSave()}
                  disabled={saving}
                >
                  {saving ? (
                    <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <Check className="size-4" aria-hidden />
                    Saved
                  </span>
                ) : null}
              </div>
            </ProfileFormCard>
          </ProfileMainCard>
        </div>

        <ProfileQuickLinks links={CLIENT_LINKS} />
      </ProfilePageGrid>
    </div>
  );
}
