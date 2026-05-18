import { SUPABASE_CONFIGURED } from "./utils";
import type { StudyPackRow, StudentPackRow } from "@/lib/database.types";

export interface CalendarEvent {
  date: string;      // YYYY-MM-DD
  label: string;
  type: "exam" | "birthday";
  href?: string;
  subtitle?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/** All published packs' exam dates + students' birthdays (day/month only, any year) */
export async function getAdminCalendarEvents(): Promise<CalendarEvent[]> {
  if (!SUPABASE_CONFIGURED) return getMockAdminEvents();

  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const [packsResult, studentsResult] = await Promise.all([
    supabase
      .from("study_packs")
      .select("id, title, exam_date, exam_name")
      .eq("status", "published")
      .not("exam_date", "is", null),
    supabase
      .from("profiles")
      .select("id, name, birthdate")
      .eq("role", "student")
      .not("birthdate", "is", null),
  ]);

  const events: CalendarEvent[] = [];

  const today = new Date();
  const currentYear = today.getFullYear();

  // Exam events — use actual exam_date
  for (const pack of (packsResult.data as { id: string; title: string; exam_date: string; exam_name: string }[]) ?? []) {
    if (!pack.exam_date) continue;
    events.push({
      date: pack.exam_date,
      label: pack.title,
      type: "exam",
      href: `/pacotes/${pack.id}`,
      subtitle: pack.exam_name,
    });
  }

  // Birthday events — project to current + next year so they always appear
  for (const student of (studentsResult.data as { id: string; name: string; birthdate: string }[]) ?? []) {
    if (!student.birthdate) continue;
    const [, month, day] = student.birthdate.split("-");
    // Add for current year and next year
    for (const year of [currentYear, currentYear + 1]) {
      const date = `${year}-${month}-${day}`;
      events.push({
        date,
        label: student.name ?? "Aluno",
        type: "birthday",
        href: `/alunos/${student.id}`,
        subtitle: "Aniversário",
      });
    }
  }

  return events;
}

function getMockAdminEvents(): CalendarEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");

  const d1 = String(today.getDate() + 5).padStart(2, "0");
  const d2 = String(today.getDate() + 12).padStart(2, "0");
  const d3 = String(today.getDate() + 3).padStart(2, "0");

  return [
    { date: `${y}-${m}-${d1}`, label: "ENEM 2024 — Matemática", type: "exam", subtitle: "ENEM" },
    { date: `${y}-${m}-${d2}`, label: "ENEM 2024 — Linguagens", type: "exam", subtitle: "ENEM" },
    { date: `${y}-${m}-${d3}`, label: "Ana Lima", type: "birthday", subtitle: "Aniversário" },
  ];
}

// ─── Student ─────────────────────────────────────────────────────────────────

/** Student's assigned packs' exam dates */
export async function getStudentCalendarEvents(studentId: string): Promise<CalendarEvent[]> {
  if (!SUPABASE_CONFIGURED) return getMockStudentEvents();

  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const assignmentsResult = await supabase
    .from("student_packs")
    .select("pack_id")
    .eq("student_id", studentId);

  const packIds = (assignmentsResult.data as StudentPackRow[] | null)?.map((a) => a.pack_id) ?? [];
  if (!packIds.length) return [];

  const packsResult = await supabase
    .from("study_packs")
    .select("id, title, exam_date, exam_name, subject")
    .in("id", packIds)
    .eq("status", "published")
    .not("exam_date", "is", null);

  const events: CalendarEvent[] = [];
  for (const pack of ((packsResult.data ?? []) as unknown as { id: string; title: string; exam_date: string; exam_name: string; subject: string }[])) {
    if (!pack.exam_date) continue;
    events.push({
      date: pack.exam_date,
      label: pack.title,
      type: "exam",
      href: `/estudar/${pack.id}`,
      subtitle: pack.subject,
    });
  }

  return events;
}

function getMockStudentEvents(): CalendarEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d1 = String(today.getDate() + 8).padStart(2, "0");
  const d2 = String(today.getDate() + 20).padStart(2, "0");
  return [
    { date: `${y}-${m}-${d1}`, label: "ENEM — Matemática", type: "exam", subtitle: "Matemática" },
    { date: `${y}-${m}-${d2}`, label: "ENEM — Linguagens", type: "exam", subtitle: "Linguagens" },
  ];
}
