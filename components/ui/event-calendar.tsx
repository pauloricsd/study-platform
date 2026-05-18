"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/data/calendar";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayString(): string {
  return toLocalDateString(new Date());
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  events: CalendarEvent[];
  /** compact = home widget; full = dedicated page */
  compact?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EventCalendar({ events, compact = false, className }: Props) {
  const today = new Date();
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year  = current.getFullYear();
  const month = current.getMonth();

  // Index events by date
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const todayStr = todayString();

  function prevMonth() {
    setCurrent(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrent(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  function handleDayClick(day: number) {
    const key = dateKey(year, month, day);
    setSelectedDay((prev) => (prev === key ? null : key));
  }

  // Upcoming events (from today forward, sorted, limited)
  const upcomingEvents = useMemo(() => {
    return events
      .filter((ev) => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, compact ? 4 : 8);
  }, [events, todayStr, compact]);

  const selectedEvents = selectedDay ? (eventMap.get(selectedDay) ?? []) : [];

  return (
    <div className={cn("space-y-4", className)}>
      {/* ── Month header ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 text-center">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground pb-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {grid.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }
          const key = dateKey(year, month, day);
          const dayEvents = eventMap.get(key) ?? [];
          const isToday = key === todayStr;
          const isSelected = key === selectedDay;
          const isPast = key < todayStr;

          const hasExam = dayEvents.some((e) => e.type === "exam");
          const hasBirthday = dayEvents.some((e) => e.type === "birthday");

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                  ? "bg-primary/10 text-primary font-bold"
                  : isPast
                  ? "text-muted-foreground/50 hover:bg-muted/40"
                  : "text-foreground hover:bg-muted/60"
              )}
            >
              <span className={cn(
                "text-xs leading-none",
                isToday && !isSelected && "font-bold"
              )}>
                {day}
              </span>

              {/* Event dots */}
              {(hasExam || hasBirthday) && (
                <div className="flex gap-0.5">
                  {hasExam && (
                    <span className={cn(
                      "h-1 w-1 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    )} />
                  )}
                  {hasBirthday && (
                    <span className={cn(
                      "h-1 w-1 rounded-full",
                      isSelected ? "bg-primary-foreground/80" : "bg-pink-500"
                    )} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary inline-block" />
          Prova
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink-500 inline-block" />
          Aniversário
        </span>
      </div>

      {/* ── Selected day panel ── */}
      {!compact && selectedEvents.length > 0 && (
        <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">
            {selectedDay
              ? new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "numeric", month: "long",
                })
              : ""}
          </p>
          <div className="space-y-1.5">
            {selectedEvents.map((ev, i) => (
              <EventRow key={i} event={ev} />
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming events list ── */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Próximos eventos
          </p>
          {upcomingEvents.map((ev, i) => (
            <EventRow key={i} event={ev} showDate />
          ))}
        </div>
      )}

      {upcomingEvents.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum evento próximo.
        </p>
      )}
    </div>
  );
}

// ─── EventRow ─────────────────────────────────────────────────────────────────

function EventRow({ event, showDate = false }: { event: CalendarEvent; showDate?: boolean }) {
  const isExam = event.type === "exam";

  const label = showDate
    ? new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", {
        day: "numeric", month: "short",
      })
    : null;

  const inner = (
    <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-muted/50 transition-colors">
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
        isExam ? "bg-primary/10" : "bg-pink-100"
      )}>
        {isExam
          ? <CalendarDays className="h-3.5 w-3.5 text-primary" />
          : <Cake className="h-3.5 w-3.5 text-pink-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{event.label}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {showDate && label ? `${label} · ` : ""}
          {event.subtitle}
        </p>
      </div>
    </div>
  );

  if (event.href) {
    return <Link href={event.href}>{inner}</Link>;
  }

  return inner;
}
