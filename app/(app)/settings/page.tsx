import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata: Metadata = {
    title: "Settings",
};
const sections = [
    { title: "Profile", desc: "Name, photo, public bio." },
    { title: "Availability", desc: "Weekly hours, buffers, locations." },
    { title: "Notifications", desc: "Email & SMS preferences." },
    { title: "Integrations", desc: "Calendar, payments, CRM." },
];
export default function SettingsPage() {
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile, availability, notifications, integrations.</p>
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {sections.map((s) => (<Card key={s.title} className="rounded-xl border border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-24 rounded-lg border border-dashed border-border bg-muted/20"/>
            </CardContent>
          </Card>))}
      </div>
    </div>);
}
