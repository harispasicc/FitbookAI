import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientsView } from "@/components/dashboard/clients-view";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<LoadingPlaceholder minHeight="min-h-[14rem]" />}>
      <ClientsView />
    </Suspense>
  );
}
