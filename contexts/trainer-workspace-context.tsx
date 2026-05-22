"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  apiGetTrainerAnalytics,
  apiListTrainerClients,
  type TrainerAnalyticsDto,
  type TrainerClientDto,
} from "@/lib/trainer-portal-api";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import { deferEffect } from "@/lib/defer-effect";

type TrainerWorkspaceContextValue = {
  clients: TrainerClientDto[];
  clientsLoading: boolean;
  clientsError: string | null;
  refreshClients: () => Promise<void>;
  analytics: TrainerAnalyticsDto | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
  refreshAnalytics: () => Promise<void>;
  isHydrated: boolean;
};

const TrainerWorkspaceContext = createContext<TrainerWorkspaceContextValue | null>(
  null,
);

export function TrainerWorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuth();
  const userId = user?.id;
  const isTrainer = user?.role === "trainer";

  const [clients, setClients] = useState<TrainerClientDto[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<TrainerAnalyticsDto | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const refreshClients = useCallback(async () => {
    if (!userId || !isTrainer) {
      setClients([]);
      setClientsError(null);
      return;
    }

    setClientsLoading(true);
    setClientsError(null);
    try {
      setClients(await apiListTrainerClients());
    } catch (e) {
      setClients([]);
      setClientsError(e instanceof Error ? e.message : "Failed to load clients");
    } finally {
      setClientsLoading(false);
    }
  }, [userId, isTrainer]);

  const refreshAnalytics = useCallback(async () => {
    if (!userId || !isTrainer) {
      setAnalytics(null);
      setAnalyticsError(null);
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      setAnalytics(await apiGetTrainerAnalytics());
    } catch (e) {
      setAnalytics(null);
      setAnalyticsError(
        e instanceof Error ? e.message : "Failed to load analytics",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, [userId, isTrainer]);

  useEffect(() => {
    if (!isHydrated || !isTrainer) return;
    deferEffect(() => void Promise.all([refreshClients(), refreshAnalytics()]));
  }, [isHydrated, isTrainer, refreshClients, refreshAnalytics]);

  useEffect(() => {
    if (!isTrainer) return;
    function onUpdate() {
      void Promise.all([refreshClients(), refreshAnalytics()]);
    }
    window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
  }, [isTrainer, refreshClients, refreshAnalytics]);

  useEffect(() => {
    if (!isTrainer) return;
    function onVisible() {
      if (document.visibilityState === "visible") {
        void Promise.all([refreshClients(), refreshAnalytics()]);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [isTrainer, refreshClients, refreshAnalytics]);

  const value = useMemo(
    () => ({
      clients,
      clientsLoading,
      clientsError,
      refreshClients,
      analytics,
      analyticsLoading,
      analyticsError,
      refreshAnalytics,
      isHydrated,
    }),
    [
      clients,
      clientsLoading,
      clientsError,
      refreshClients,
      analytics,
      analyticsLoading,
      analyticsError,
      refreshAnalytics,
      isHydrated,
    ],
  );

  return (
    <TrainerWorkspaceContext.Provider value={value}>
      {children}
    </TrainerWorkspaceContext.Provider>
  );
}

export function useTrainerWorkspace() {
  const ctx = useContext(TrainerWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useTrainerWorkspace must be used within TrainerWorkspaceProvider",
    );
  }
  return ctx;
}
