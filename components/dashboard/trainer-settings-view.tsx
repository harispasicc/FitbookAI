"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  Check,
  Globe,
  MapPin,
  Phone,
  Plug,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { BusyDots, LoadingPlaceholder } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  defaultTrainerProfileExtension,
  readTrainerProfileExtension,
  writeTrainerProfileExtension,
  type TrainerProfileExtension,
} from "@/lib/trainer-profile-extension";
import {
  defaultTrainerSettingsPrefs,
  readTrainerSettingsPrefs,
  writeTrainerSettingsPrefs,
  type TrainerSettingsPrefs,
} from "@/lib/trainer-settings-storage";
import {
  apiGetTrainerProfile,
  apiGetTrainerSettings,
  apiGetWeeklyAvailability,
  apiPatchTrainerProfile,
  apiPatchTrainerSettings,
  apiPatchWeeklyAvailability,
  type WeeklyDayDto,
} from "@/lib/trainer-portal-api";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";
import { TrainerPlanSettingsCard } from "@/components/dashboard/trainer-plan-settings-card";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

const timezones = [
  "Europe/Sarajevo",
  "Europe/Belgrade",
  "Europe/Zagreb",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "UTC",
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/15 px-3 py-2.5",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SavedHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
      <Check className="size-4" aria-hidden />
      Saved
    </span>
  );
}

export function TrainerSettingsView() {
  const { user, updateProfile } = useAuth();
  const { canAccessFeature } = useTrainerPlan();
  const hasAdvancedCalendar = canAccessFeature("advancedCalendar");
  const hasSmsReminders = canAccessFeature("smsReminders");

  const [profileLoading, setProfileLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [ext, setExt] = useState<TrainerProfileExtension>(defaultTrainerProfileExtension);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [weeklyDays, setWeeklyDays] = useState<WeeklyDayDto[]>([]);
  const [editingDays, setEditingDays] = useState<Set<number>>(() => new Set());
  const [bufferMinutes, setBufferMinutes] = useState("15");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);

  const [prefs, setPrefs] = useState<TrainerSettingsPrefs>(defaultTrainerSettingsPrefs);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const profile = await apiGetTrainerProfile();
      setDisplayName(profile.fullName ?? user.name);
      setSpecialty(profile.specialty ?? "");
      setBio(profile.bio ?? "");
      setYearsExperience(String(profile.yearsExperience ?? 0));
      setExt(readTrainerProfileExtension(user.email));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const loadAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    try {
      const { days } = await apiGetWeeklyAvailability();
      setWeeklyDays(days);
      setEditingDays(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load availability");
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    deferEffect(() => {
      const local = readTrainerSettingsPrefs(user.email);
      setPrefs(local);
      setBufferMinutes(String(local.workspace.sessionBufferMinutes));
      setDefaultLocation(local.workspace.defaultLocation);
      void loadProfile();
      void loadAvailability();
      void apiGetTrainerSettings()
        .then(({ notifications }) => {
          setPrefs((p) => ({ ...p, notifications }));
        })
        .catch(() => undefined);
    });
  }, [user, loadProfile, loadAvailability]);

  async function saveProfile() {
    if (!user) return;
    const years = Number.parseInt(yearsExperience, 10);
    if (Number.isNaN(years) || years < 0 || years > 60) {
      setError("Years of experience must be between 0 and 60.");
      return;
    }
    setProfileSaving(true);
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
      setProfileSaved(true);
      window.setTimeout(() => setProfileSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveAvailability() {
    if (!user) return;
    const buffer = Number.parseInt(bufferMinutes, 10);
    if (Number.isNaN(buffer) || buffer < 0 || buffer > 120) {
      setError("Buffer must be between 0 and 120 minutes.");
      return;
    }
    setAvailabilitySaving(true);
    setError(null);
    try {
      const result = await apiPatchWeeklyAvailability({
        days: weeklyDays.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          enabled: d.enabled,
          startTime: d.startTime.slice(0, 5),
          endTime: d.endTime.slice(0, 5),
        })),
      });
      setWeeklyDays(result.days);
      setEditingDays(new Set());
      (document.activeElement as HTMLElement | null)?.blur();
      const nextPrefs = {
        ...prefs,
        workspace: {
          sessionBufferMinutes: buffer,
          defaultLocation: defaultLocation.trim(),
        },
      };
      setPrefs(nextPrefs);
      writeTrainerSettingsPrefs(user.email, nextPrefs);
      setAvailabilitySaved(true);
      window.setTimeout(() => setAvailabilitySaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save availability");
    } finally {
      setAvailabilitySaving(false);
    }
  }

  async function savePrefs() {
    if (!user) return;
    setPrefsSaving(true);
    setError(null);
    try {
      await apiPatchTrainerSettings({ notifications: prefs.notifications });
      writeTrainerSettingsPrefs(user.email, prefs);
      setPrefsSaved(true);
      window.setTimeout(() => setPrefsSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save notification settings");
    } finally {
      setPrefsSaving(false);
    }
  }

  function updateDay(index: number, patch: Partial<WeeklyDayDto>) {
    setWeeklyDays((days) =>
      days.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }

  function toggleDayEditing(index: number, checked: boolean) {
    const day = weeklyDays[index];
    if (!day) return;
    setEditingDays((prev) => {
      const next = new Set(prev);
      if (checked) next.add(day.dayOfWeek);
      else next.delete(day.dayOfWeek);
      return next;
    });
    updateDay(index, { enabled: checked });
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">Coach sign in to manage settings.</p>
    );
  }

  const initialLoading = profileLoading && availabilityLoading;

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Profile, weekly hours, notifications, and workspace preferences.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {initialLoading ? (
        <LoadingPlaceholder minHeight="min-h-[16rem]" />
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <TrainerPlanSettingsCard />

          <Card className="rounded-2xl border border-border/80 shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4 text-primary" aria-hidden />
                Profile
              </CardTitle>
              <CardDescription>
                Shown on Find coaches — name, specialty, bio, and experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {profileLoading ? (
                <div className="flex justify-center py-8">
                  <BusyDots />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="display-name">Display name</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Strength training, rehab…"
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
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="size-3.5" aria-hidden />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={ext.phone}
                        onChange={(e) => setExt((x) => ({ ...x, phone: e.target.value }))}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden />
                        City
                      </Label>
                      <Input
                        id="city"
                        value={ext.city}
                        onChange={(e) => setExt((x) => ({ ...x, city: e.target.value }))}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tz" className="flex items-center gap-1.5">
                        <Globe className="size-3.5" aria-hidden />
                        Timezone
                      </Label>
                      <select
                        id="tz"
                        value={ext.timezone}
                        onChange={(e) =>
                          setExt((x) => ({ ...x, timezone: e.target.value }))
                        }
                        className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                        rows={3}
                        className="flex w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      className="rounded-xl"
                      disabled={profileSaving}
                      onClick={() => void saveProfile()}
                    >
                      {profileSaving ? <BusyDots size="sm" className="mr-2" /> : null}
                      Save profile
                    </Button>
                    <SavedHint show={profileSaved} />
                    {user.trainerProfileId ? (
                      <Button variant="outline" size="sm" className="rounded-xl" asChild>
                        <Link href={`/coaches/${user.trainerProfileId}`}>Preview public profile</Link>
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4 text-primary" aria-hidden />
                Availability
              </CardTitle>
              <CardDescription>
                Weekly hours for planning. Add open slots per service under{" "}
                <Link href="/services" className="font-medium text-primary underline-offset-2 hover:underline">
                  Services
                </Link>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {!hasAdvancedCalendar ? (
                <PlanUpgradePrompt
                  requiredPlan="pro"
                  feature="advancedCalendar"
                  title="Weekly templates require Pro"
                  description="Free plan uses the bookings list on Calendar. Pro unlocks weekly hours here and the week grid."
                />
              ) : availabilityLoading ? (
                <div className="flex justify-center py-8">
                  <BusyDots />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {weeklyDays.map((day, index) => {
                      const isEditing = editingDays.has(day.dayOfWeek);
                      const isSaved = day.enabled && !isEditing;
                      return (
                        <div
                          key={day.dayOfWeek}
                          className={cn(
                            "grid gap-2 rounded-xl border p-3 sm:grid-cols-[auto_1fr_1fr_auto]",
                            isEditing
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/70 bg-muted/10",
                          )}
                        >
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                              type="checkbox"
                              checked={isEditing}
                              onChange={(e) => toggleDayEditing(index, e.target.checked)}
                              className="size-4 rounded accent-primary"
                            />
                            <span className="w-24">{day.dayLabel}</span>
                            {isSaved ? (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                Active
                              </span>
                            ) : null}
                          </label>
                          <Input
                            type="time"
                            value={day.startTime.slice(0, 5)}
                            disabled={!isEditing && !day.enabled}
                            onChange={(e) =>
                              updateDay(index, { startTime: e.target.value })
                            }
                            className="h-9 rounded-lg"
                          />
                          <Input
                            type="time"
                            value={day.endTime.slice(0, 5)}
                            disabled={!isEditing && !day.enabled}
                            onChange={(e) =>
                              updateDay(index, { endTime: e.target.value })
                            }
                            className="h-9 rounded-lg"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buffer">Buffer between sessions (min)</Label>
                      <Input
                        id="buffer"
                        type="number"
                        min={0}
                        max={120}
                        value={bufferMinutes}
                        onChange={(e) => setBufferMinutes(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Default location / format</Label>
                      <Input
                        id="location"
                        value={defaultLocation}
                        onChange={(e) => setDefaultLocation(e.target.value)}
                        placeholder="Gym, online, hybrid…"
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      className="rounded-xl"
                      disabled={availabilitySaving}
                      onClick={() => void saveAvailability()}
                    >
                      {availabilitySaving ? <BusyDots size="sm" className="mr-2" /> : null}
                      Save availability
                    </Button>
                    <SavedHint show={availabilitySaved} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4 text-primary" aria-hidden />
                Notifications
              </CardTitle>
              <CardDescription>
                Email alerts for bookings (requires RESEND_API_KEY on the server).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow
                label="New booking request"
                description="When a client books a session"
                checked={prefs.notifications.emailNewBooking}
                onChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, emailNewBooking: v },
                  }))
                }
              />
              <ToggleRow
                label="Booking confirmed"
                checked={prefs.notifications.emailBookingConfirmed}
                onChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, emailBookingConfirmed: v },
                  }))
                }
              />
              <ToggleRow
                label="Booking cancelled"
                checked={prefs.notifications.emailBookingCancelled}
                onChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, emailBookingCancelled: v },
                  }))
                }
              />
              <ToggleRow
                label="Daily digest"
                description="Morning summary of the day ahead"
                checked={prefs.notifications.emailDailyDigest}
                onChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, emailDailyDigest: v },
                  }))
                }
              />
              <Separator />
              <p className="text-xs font-medium text-muted-foreground">SMS (Pro+)</p>
              <ToggleRow
                label="SMS booking reminder"
                description={hasSmsReminders ? "Text clients before sessions" : "Upgrade to Pro to enable SMS"}
                checked={false}
                disabled
                onChange={() => undefined}
              />
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => void savePrefs()}
                  disabled={prefsSaving}
                >
                  {prefsSaving ? <BusyDots size="sm" className="mr-2" /> : null}
                  Save notifications
                </Button>
                <SavedHint show={prefsSaved} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="size-4 text-primary" aria-hidden />
                Integrations
              </CardTitle>
              <CardDescription>Connect tools to sync calendar and payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Two-way sync for sessions</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming soon
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Stripe payouts</p>
                  <p className="text-xs text-muted-foreground">Collect session payments</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming soon
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Use <Link href="/services" className="text-primary underline-offset-2 hover:underline">Services</Link> and{" "}
                <Link href="/calendar" className="text-primary underline-offset-2 hover:underline">Calendar</Link> for live booking today.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
