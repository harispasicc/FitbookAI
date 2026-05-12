"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Globe, MapPin, Phone, Sparkles, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { defaultClientProfileExtension, readClientProfileExtension, writeClientProfileExtension, type ClientProfileExtension, } from "@/lib/client-profile-extension";
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
export function ClientProfileView() {
    const { user, updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [ext, setExt] = useState<ClientProfileExtension>(defaultClientProfileExtension);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        if (!user)
            return;
        setDisplayName(user.name);
        setExt(readClientProfileExtension(user.email));
    }, [user]);
    const onSave = useCallback(() => {
        if (!user)
            return;
        updateProfile({ name: displayName });
        writeClientProfileExtension(user.email, ext);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
    }, [user, displayName, ext, updateProfile]);
    if (!user) {
        return <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>;
    }
    return (<div className="min-w-0 space-y-8 sm:space-y-10">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Profile</h1>
        <p className="text-sm text-muted-foreground">
          How you appear in the workspace and what your coach may see in session notes and messaging.
        </p>
      </div>

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
                  <p className="text-lg font-semibold text-foreground">{displayName || user.name}</p>
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
                  <Label htmlFor="client-display-name" className="flex items-center gap-2">
                    <User className="size-3.5 text-muted-foreground" aria-hidden/>
                    Display name
                  </Label>
                  <Input id="client-display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-10 rounded-xl" autoComplete="name"/>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input id="client-email" value={user.email} disabled className="h-10 rounded-xl bg-muted/50"/>
                  <p className="text-xs text-muted-foreground">Email is tied to your account in this demo build.</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-headline" className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-muted-foreground" aria-hidden/>
                    Headline
                  </Label>
                  <Input id="client-headline" value={ext.headline} onChange={(e) => setExt((x) => ({ ...x, headline: e.target.value }))} placeholder="One line about your training focus" className="h-10 rounded-xl"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone" className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground" aria-hidden/>
                    Phone
                  </Label>
                  <Input id="client-phone" type="tel" value={ext.phone} onChange={(e) => setExt((x) => ({ ...x, phone: e.target.value }))} placeholder="+387 …" className="h-10 rounded-xl"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-city" className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" aria-hidden/>
                    City / region
                  </Label>
                  <Input id="client-city" value={ext.city} onChange={(e) => setExt((x) => ({ ...x, city: e.target.value }))} placeholder="Sarajevo" className="h-10 rounded-xl"/>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-tz" className="flex items-center gap-2">
                    <Globe className="size-3.5 text-muted-foreground" aria-hidden/>
                    Timezone
                  </Label>
                  <select id="client-tz" value={ext.timezone} onChange={(e) => setExt((x) => ({ ...x, timezone: e.target.value }))} className="flex h-10 w-full max-w-md rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {timezones.map((tz) => (<option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="client-bio">Bio</Label>
                  <textarea id="client-bio" value={ext.bio} onChange={(e) => setExt((x) => ({ ...x, bio: e.target.value }))} placeholder="Short note for your coach — goals, style, anything useful before sessions." rows={4} className="flex w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"/>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" className="rounded-xl" onClick={onSave}>
                  Save changes
                </Button>
                {saved ? (<span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <Check className="size-4" aria-hidden/>
                    Saved
                  </span>) : null}
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
                <Link href="/me">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/me/sessions">Sessions</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/me/progress">Progress</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/coaches">Find coaches</Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start rounded-lg font-normal" asChild>
                <Link href="/me/ai">FitBook AI</Link>
              </Button>
            </CardContent>
          </Card>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Profile photo upload and coach-facing sync would connect here in a production build.
          </p>
        </aside>
      </div>
    </div>);
}
