import Link from "next/link";
import { BarChart3, CalendarPlus, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const actions = [
    { label: "Calendar", href: "/calendar", icon: CalendarPlus },
    { label: "Add client", href: "/clients", icon: UserPlus },
    { label: "AI Assistant", href: "/ai", icon: Sparkles },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
] as const;
export function QuickActions() {
    return (<Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
        <CardDescription>Shortcuts to the flows you use most.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map(({ label, href, icon: Icon }) => (<Button key={href} asChild variant="outline" size="sm" className="rounded-lg border-border/80">
            <Link href={href} className="gap-2">
              <Icon className="size-4" aria-hidden/>
              {label}
            </Link>
          </Button>))}
      </CardContent>
    </Card>);
}
