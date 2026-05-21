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
  apiListMyBookings,
  apiListTrainerBookings,
} from "@/lib/bookings-api";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import { deferEffect } from "@/lib/defer-effect";
import { bookingDtoToRow } from "@/lib/map-booking-to-row";
import type { BookingRow } from "@/lib/mock-bookings";

type BookingsContextValue = {
  rows: BookingRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isHydrated: boolean;
};

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId || (userRole !== "client" && userRole !== "trainer")) {
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookings =
        userRole === "client"
          ? await apiListMyBookings({ limit: 100 })
          : await apiListTrainerBookings({ limit: 100 });

      setRows(
        bookings.map((b) =>
          bookingDtoToRow(b, userRole === "client" ? "client" : "trainer"),
        ),
      );
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (!isHydrated) return;
    deferEffect(() => void refresh());
  }, [isHydrated, refresh]);

  useEffect(() => {
    function onUpdate() {
      void refresh();
    }
    window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
  }, [refresh]);

  const value = useMemo(
    () => ({ rows, loading, error, refresh, isHydrated }),
    [rows, loading, error, refresh, isHydrated],
  );

  return (
    <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
  );
}

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error("useBookings must be used within BookingsProvider");
  }
  return ctx;
}
