"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  LayoutGrid,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { Input } from "@/components/ui/input";
import {
  apiTrainerSearch,
  type TrainerSearchItemDto,
  type TrainerSearchResponseDto,
} from "@/lib/trainer-portal-api";
const EMPTY: TrainerSearchResponseDto = {
  query: "",
  clients: [],
  bookings: [],
  services: [],
  pages: [],
};

function itemIcon(type: TrainerSearchItemDto["type"]) {
  switch (type) {
    case "client":
      return User;
    case "booking":
      return Calendar;
    case "service":
      return Wrench;
    case "page":
      return LayoutGrid;
  }
}

function SearchGroup({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: TrainerSearchItemDto[];
  onSelect: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div role="group" aria-label={label}>
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="pb-1">
        {items.map((item) => {
          const Icon = itemIcon(item.type);
          return (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={item.href}
                onClick={onSelect}
                className="flex items-start gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/80"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{item.title}</span>
                  {item.subtitle ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DashboardSearch() {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TrainerSearchResponseDto>(EMPTY);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setResults(EMPTY);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiTrainerSearch(trimmed);
      setResults(data);
    } catch (e) {
      setResults(EMPTY);
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, open, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        close();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const total =
    results.clients.length +
    results.bookings.length +
    results.services.length +
    results.pages.length;

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative min-h-9 min-w-0 flex-1 max-w-md">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) {
            if (results.clients[0]) {
              router.push(results.clients[0].href);
              close();
              setQuery("");
            } else if (results.bookings[0]) {
              router.push(results.bookings[0].href);
              close();
              setQuery("");
            } else if (results.pages[0]) {
              router.push(results.pages[0].href);
              close();
              setQuery("");
            }
          }
        }}
        placeholder="Search clients, bookings, services…"
        className="h-9 w-full min-w-0 rounded-lg border-border/80 bg-muted/40 pl-9 text-sm"
        aria-label="Search workspace"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        autoComplete="off"
      />

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,24rem)] overflow-y-auto rounded-xl border border-border/80 bg-background shadow-lg"
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <BusyDots />
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-sm text-destructive">{error}</p>
          ) : total === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <div className="py-1">
              <SearchGroup label="Clients" items={results.clients} onSelect={close} />
              <SearchGroup label="Bookings" items={results.bookings} onSelect={close} />
              <SearchGroup label="Services" items={results.services} onSelect={close} />
              <SearchGroup label="Pages" items={results.pages} onSelect={close} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
