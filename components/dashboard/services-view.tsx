"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { useAuth } from "@/contexts/auth-context";
import {
  apiCreateTrainerService,
  apiListTrainerServices,
  apiPatchTrainerService,
  type TrainerServiceDto,
} from "@/lib/trainer-portal-api";
import { deferEffect } from "@/lib/defer-effect";
import { fitnessImages } from "@/lib/media-urls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServiceOpenTimes } from "@/components/dashboard/service-open-times";
import { cn } from "@/lib/utils";

const serviceHero = [fitnessImages.dumbbells, fitnessImages.stretch, fitnessImages.track] as const;

const emptyForm = {
  title: "",
  description: "",
  durationMinutes: "60",
  priceEuros: "",
};

export function ServicesView() {
  const { user } = useAuth();
  const [services, setServices] = useState<TrainerServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiListTrainerServices();
      setServices(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    deferEffect(() => void load());
  }, [load]);

  async function toggleActive(service: TrainerServiceDto) {
    try {
      const updated = await apiPatchTrainerService(service.id, {
        isActive: !service.isActive,
      });
      setServices((cur) => cur.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update service");
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const duration = Number.parseInt(form.durationMinutes, 10);
    const priceEuros = Number.parseFloat(form.priceEuros.replace(",", "."));
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (Number.isNaN(duration) || duration < 15) {
      setError("Duration must be at least 15 minutes.");
      return;
    }
    if (Number.isNaN(priceEuros) || priceEuros < 0) {
      setError("Enter a valid price in euros.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await apiCreateTrainerService({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        durationMinutes: duration,
        priceCents: Math.round(priceEuros * 100),
      });
      setServices((cur) => [...cur, created]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create service");
    } finally {
      setSaving(false);
    }
  }

  const coachProfileId = user?.trainerProfileId;

  return (
    <motion.div
      className="min-w-0 space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
      >
        <motion.div className="min-w-0 space-y-1">
          <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
            Services
          </h1>
          <p className="text-sm text-muted-foreground">
            Offerings clients see on your public profile: price, duration, and visibility.
          </p>
          {coachProfileId ? (
            <p className="text-xs text-muted-foreground">
              Preview on{" "}
              <Link
                href={`/coaches/${coachProfileId}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                your coach profile
              </Link>
              .
            </p>
          ) : null}
        </motion.div>
        <Button
          type="button"
          className="shrink-0 gap-2 rounded-xl"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="size-4" aria-hidden />
          Add service
        </Button>
      </motion.div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <Card className="rounded-2xl border border-primary/20 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New service</CardTitle>
            <CardDescription>
              Active services appear when clients book on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void onCreate(e)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="svc-title">Title</Label>
                <Input
                  id="svc-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="1-on-1 Coaching"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="svc-desc">Description (optional)</Label>
                <Input
                  id="svc-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Personalized session online or in person"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-duration">Duration (minutes)</Label>
                <Input
                  id="svc-duration"
                  type="number"
                  min={15}
                  max={480}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationMinutes: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-price">Price (€)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.priceEuros}
                  onChange={(e) => setForm((f) => ({ ...f, priceEuros: e.target.value }))}
                  placeholder="50"
                  required
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving} className="rounded-xl">
                  {saving ? <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" /> : "Save service"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <LoadingPlaceholder minHeight="min-h-[12rem]" />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No services yet"
          description="Add your first offering so clients can book sessions and see pricing on your public profile."
        >
          <Button
            type="button"
            className="min-h-10 rounded-xl"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" aria-hidden />
            Add service
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src={serviceHero[i % serviceHero.length]}
                    alt=""
                    fill
                    className={cn(
                      "object-cover transition-opacity",
                      !s.isActive && "opacity-40",
                    )}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <span
                    className={cn(
                      "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                      s.isActive
                        ? "bg-emerald-500/90 text-white ring-emerald-600/40"
                        : "bg-background/90 text-muted-foreground ring-border",
                    )}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <CardDescription>
                    {s.durationMinutes} min · {s.priceLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  {s.description ? (
                    <p className="text-pretty leading-relaxed">{s.description}</p>
                  ) : (
                    <p className="text-xs italic">No description</p>
                  )}
                  <ServiceOpenTimes service={s} />
                  <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <p className="text-xs text-muted-foreground">
                      Only active services appear on your public profile.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => void toggleActive(s)}
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
