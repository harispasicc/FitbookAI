import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
export default function AppLayout({ children }: {
    children: ReactNode;
}) {
    return (<AuthGuard>
      <RoleGuard role="trainer" redirectTo="/me">
        <DashboardShell>{children}</DashboardShell>
      </RoleGuard>
    </AuthGuard>);
}
