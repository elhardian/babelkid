import { prisma } from "@/lib/db";
import { fromDateOnly } from "@/lib/dates";
import {
  mapActivity,
  mapDayOff,
  mapPresence,
  mapReport,
} from "@/lib/data/mappers";
import type {
  ClassActivity,
  PresenceRecord,
  SchoolDayOff,
  StudentReport,
} from "@/lib/types";

export async function listDayOffs(): Promise<SchoolDayOff[]> {
  const rows = await prisma.schoolDayOff.findMany({ orderBy: { date: "asc" } });
  return rows.map(mapDayOff);
}

export async function upsertDayOff(input: {
  id?: string;
  date: string;
  title: string;
  description?: string;
  type: SchoolDayOff["type"];
}): Promise<SchoolDayOff> {
  const data = {
    date: fromDateOnly(input.date),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    type: input.type,
  };
  if (input.id) {
    return mapDayOff(
      await prisma.schoolDayOff.update({ where: { id: input.id }, data }),
    );
  }
  const existing = await prisma.schoolDayOff.findUnique({
    where: { date: data.date },
  });
  if (existing) {
    return mapDayOff(
      await prisma.schoolDayOff.update({ where: { id: existing.id }, data }),
    );
  }
  return mapDayOff(await prisma.schoolDayOff.create({ data }));
}

export async function removeDayOff(id: string) {
  await prisma.schoolDayOff.delete({ where: { id } });
}

export async function listPresence(): Promise<PresenceRecord[]> {
  const rows = await prisma.presenceRecord.findMany({
    orderBy: [{ date: "desc" }, { studentId: "asc" }],
  });
  return rows.map(mapPresence);
}

export async function upsertPresence(input: {
  id?: string;
  studentId: string;
  classId: string;
  date: string;
  status: PresenceRecord["status"];
  note?: string;
  recordedBy: string;
}): Promise<PresenceRecord> {
  const date = fromDateOnly(input.date);
  const data = {
    studentId: input.studentId,
    classId: input.classId,
    date,
    status: input.status,
    note: input.note?.trim() || null,
    recordedBy: input.recordedBy,
  };
  if (input.id) {
    return mapPresence(
      await prisma.presenceRecord.update({ where: { id: input.id }, data }),
    );
  }
  return mapPresence(
    await prisma.presenceRecord.upsert({
      where: {
        studentId_date: { studentId: input.studentId, date },
      },
      create: data,
      update: {
        status: input.status,
        note: data.note,
        classId: input.classId,
        recordedBy: input.recordedBy,
      },
    }),
  );
}

export async function upsertPresenceBatch(
  rows: {
    studentId: string;
    classId: string;
    date: string;
    status: PresenceRecord["status"];
    note?: string;
    recordedBy: string;
  }[],
) {
  for (const row of rows) {
    await upsertPresence(row);
  }
  return listPresence();
}

export async function listActivities(): Promise<ClassActivity[]> {
  const rows = await prisma.classActivity.findMany({
    orderBy: { date: "desc" },
  });
  return rows.map(mapActivity);
}

export async function upsertActivity(input: {
  id?: string;
  classId: string;
  title: string;
  description: string;
  date: string;
  teacherId?: string;
  teacherName: string;
  images: string[];
  videoUrl?: string;
  location?: string;
}): Promise<ClassActivity> {
  const data = {
    classId: input.classId,
    title: input.title.trim(),
    description: input.description.trim(),
    date: fromDateOnly(input.date),
    teacherId: input.teacherId || null,
    teacherName: input.teacherName,
    images: input.images,
    videoUrl: input.videoUrl || null,
    location: input.location?.trim() || null,
  };
  if (input.id) {
    return mapActivity(
      await prisma.classActivity.update({ where: { id: input.id }, data }),
    );
  }
  return mapActivity(await prisma.classActivity.create({ data }));
}

export async function removeActivity(id: string) {
  await prisma.classActivity.delete({ where: { id } });
}

export async function listReports(): Promise<StudentReport[]> {
  const rows = await prisma.studentReport.findMany({
    orderBy: { date: "desc" },
  });
  return rows.map(mapReport);
}

export async function upsertReport(input: {
  id?: string;
  studentId: string;
  teacherId: string;
  date: string;
  title: string;
  mood: StudentReport["mood"];
  activities: string;
  notes: string;
  skills: string[];
}): Promise<StudentReport> {
  const data = {
    studentId: input.studentId,
    teacherId: input.teacherId,
    date: fromDateOnly(input.date),
    title: input.title.trim(),
    mood: input.mood,
    activities: input.activities,
    notes: input.notes,
    skills: input.skills,
  };
  if (input.id) {
    return mapReport(
      await prisma.studentReport.update({ where: { id: input.id }, data }),
    );
  }
  return mapReport(await prisma.studentReport.create({ data }));
}

export async function removeReport(id: string) {
  await prisma.studentReport.delete({ where: { id } });
}
