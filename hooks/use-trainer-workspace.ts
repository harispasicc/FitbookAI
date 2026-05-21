"use client";

import { useTrainerWorkspace } from "@/contexts/trainer-workspace-context";

export function useTrainerClients() {
  const {
    clients,
    clientsLoading,
    clientsError,
    refreshClients,
    isHydrated,
  } = useTrainerWorkspace();
  return {
    clients,
    loading: clientsLoading,
    error: clientsError,
    refresh: refreshClients,
    isHydrated,
  };
}

export function useTrainerAnalytics() {
  const {
    analytics,
    analyticsLoading,
    analyticsError,
    refreshAnalytics,
    isHydrated,
  } = useTrainerWorkspace();
  return {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refresh: refreshAnalytics,
    isHydrated,
  };
}
