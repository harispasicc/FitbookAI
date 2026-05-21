"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Globe, Loader2, MapPin, Phone, Sparkles, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  defaultTrainerProfileExtension,
  readTrainerProfileExtension,
  writeTrainerProfileExtension,
  type TrainerProfileExtension,
} from "@/lib/trainer-profile-extension";
import {
  apiGetTrainerProfile,
  apiPatchTrainerProfile,
} from "@/lib/trainer-portal-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

export function TrainerProfilePageView() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [ext, setExt] = useState<TrainerProfileExtension>(
    defaultTrainerProfileExtension,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const profile = await apiGetTrainerProfile();
        if (cancelled) return;
        setDisplayName(profile.fullName ?? currentUser.name);
        setSpecialty(profile.specialty ?? "");
        setBio(profile.bio ?? "");
        setYearsExperience(String(profile.yearsExperience ?? 0));
        setExt(readTrainerProfileExtension(currentUser.email));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onSave = useCallback(async () => {
    if (!user) return;

    const years = Number.parseInt(yearsExperience, 10);
    if (Number.isNaN(years) || years < 0 || years > 60) {
      setError("Years of experience must be between 0 and 60.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await apiPatchTrainerProfile({
        fullName: displayName.trim() || user.name,
        specialty: specialty.trim() || undefined,
        bio: bio.trim() || undefined,
        yearsExperience: years,
      });
      updateProfile({ name: displayName.trim() || user.name });
      writeTrainerProfileExtension(user.email, ext);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [user, displayName, specialty, bio, yearsExperience, ext, updateProfile]);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Coach sign in to view your profile.
      </p>
    );
  }

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Public marketplace fields (bio, specialty, experience) sync to Find coaches.
          Phone and city stay in your workspace for now.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading profile…
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_17rem] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar className="size-20 border border-border bg-card shadow-sm sm:size-24">
                  <AvatarFallback className="text-lg font-semibold sm:text-xl">
                    {initials(displayName || user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {displayName || user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className="inline-flex w-fit rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
                    {user.role}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="display-name" className="flex items-center gap-2">
                    <User className="size-3.5 text-muted-foreground" aria-hidden />
                    Display name
                  </Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 rounded-xl"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="h-10 rounded-xl bg-muted/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="specialty" className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-muted-foreground" aria-hidden />
                    Specialty (shown on marketplace)
                  </Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Strength training, rehab, nutrition…"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">Years of experience</Label>
                  <Input
                    id="years"
                    type="number"
                    min={0}
                    max={60}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                    Phone (workspace)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={ext.phone}
                    onChange={(e) =>
                      setExt((x) => ({ ...x, phone: e.target.value }))
                    }
                    placeholder="+387 …"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                    City / region
                  </Label>
                  <Input
                    id="city"
                    value={ext.city}
                    onChange={(e) => setExt((x) => ({ ...x, city: e.target.value }))}
                    placeholder="Sarajevo"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tz" className="flex items-center gap-2">
                    <Globe className="size-3.5 text-muted-foreground" aria-hidden />
                    Timezone
                  </Label>
                  <select
                    id="tz"
                    value={ext.timezone}
                    onChange={(e) =>
                      setExt((x) => ({ ...x, timezone: e.target.value }))
                    }
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
                  <Label htmlFor="bio">Public bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Certifications, coaching style, who you help…"
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
                  disabled={saving}
                  onClick={() => void onSave()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <Check className="size-4" aria-hidden />
                    Saved — visible on Find coaches
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick links</CardTitle>
              <CardDescription>Workspace shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/services">Services & pricing</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/calendar">Calendar</Link>
              </Button>
            </CardContent>
          </Card>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Session prices on coach cards come from your active services under Services & pricing.
          </p>
        </aside>
      </div>
    </div>
  );
}
