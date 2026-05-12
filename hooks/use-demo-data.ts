"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { DemoState } from "@/lib/demo-types";
import { DEMO_DATA_UPDATE_EVENT } from "@/lib/demo-data-events";
import { LEGACY_PORTFOLIO_STORAGE_KEY, PORTFOLIO_STORAGE_KEY, readDemoState } from "@/lib/demo-storage";
export function useDemoData() {
    const { user, isHydrated } = useAuth();
    const [data, setData] = useState<DemoState | null>(null);
    const refresh = useCallback(() => {
        if (!user) {
            setData(null);
            return;
        }
        setData(readDemoState());
    }, [user]);
    useEffect(() => {
        if (!isHydrated)
            return;
        queueMicrotask(() => {
            refresh();
        });
    }, [isHydrated, user?.email, refresh]);
    useEffect(() => {
        function onStorage(e: StorageEvent) {
            if (e.key === PORTFOLIO_STORAGE_KEY || e.key === LEGACY_PORTFOLIO_STORAGE_KEY || e.key === null)
                refresh();
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [refresh]);
    useEffect(() => {
        function onDemoUpdate() {
            refresh();
        }
        window.addEventListener(DEMO_DATA_UPDATE_EVENT, onDemoUpdate);
        return () => window.removeEventListener(DEMO_DATA_UPDATE_EVENT, onDemoUpdate);
    }, [refresh]);
    return { data, refresh };
}
