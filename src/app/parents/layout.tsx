import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ParentsLayoutClient } from "@/components/parents/ParentsLayoutClient";
import * as roster from "@/lib/data/roster";
import * as ops from "@/lib/data/ops";
import * as eventsData from "@/lib/data/events";
import * as finance from "@/lib/data/finance";

export default async function ParentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.portal !== "parent") {
    redirect("/app");
  }

  const [students, classes, dayOffs, activities, presence, tuition, schoolEvents] =
    await Promise.all([
      roster.listStudents(),
      roster.listClasses(),
      ops.listDayOffs(),
      ops.listActivities(),
      ops.listPresence(),
      finance.listTuition(),
      eventsData.listEvents(),
    ]);

  const kids = students.filter((s) => session.childIds.includes(s.id));

  return (
    <ParentsLayoutClient
      parentName={session.name}
      parentEmail={session.email}
      childIds={session.childIds}
      students={kids}
      registry={{
        students,
        classes,
        dayOffs,
        activities,
        presence,
        tuition,
        events: schoolEvents,
      }}
    >
      {children}
    </ParentsLayoutClient>
  );
}
