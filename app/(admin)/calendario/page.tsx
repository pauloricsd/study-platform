import { Topbar } from "@/components/layout/topbar";
import { EventCalendar } from "@/components/ui/event-calendar";
import { getAdminCalendarEvents } from "@/lib/data/calendar";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const events = await getAdminCalendarEvents();

  return (
    <>
      <Topbar title="Calendário" />
      <main className="p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
          <EventCalendar events={events} />
        </div>
      </main>
    </>
  );
}
