import { Topbar } from "@/components/layout/topbar";
import { EventCalendar } from "@/components/ui/event-calendar";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStudentCalendarEvents } from "@/lib/data/calendar";

export const dynamic = "force-dynamic";

export default async function StudentCalendarPage() {
  const profile = await getCurrentProfile();
  const events = profile ? await getStudentCalendarEvents(profile.id) : [];

  return (
    <>
      <Topbar title="Calendário" />
      <main className="mx-auto max-w-2xl px-4 lg:px-8 py-6">
        <div className="rounded-2xl border bg-white p-5 lg:p-8">
          <EventCalendar events={events} />
        </div>
      </main>
    </>
  );
}
