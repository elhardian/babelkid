import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { fromDateOnly } from "@/lib/dates";
import { mapEvent, mapRegistration } from "@/lib/data/mappers";
import type { RegistrationApplication, SchoolEvent } from "@/lib/types";

function jsonOrUndef(value: unknown) {
  if (value === null || value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

export async function listEvents(): Promise<SchoolEvent[]> {
  const rows = await prisma.schoolEvent.findMany({
    include: { documentation: true, attendees: true },
    orderBy: { date: "desc" },
  });
  return rows.map(mapEvent);
}

export async function getEventById(id: string): Promise<SchoolEvent | null> {
  const row = await prisma.schoolEvent.findUnique({
    where: { id },
    include: { documentation: true, attendees: true },
  });
  return row ? mapEvent(row) : null;
}

export async function upsertEvent(input: {
  id?: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  feePerChild: number;
  status: SchoolEvent["status"];
  coverGradient: string;
  coverImage: string;
  documentation?: SchoolEvent["documentation"];
  attendees?: string[];
}): Promise<SchoolEvent> {
  const id = input.id ?? `ev-${Date.now()}`;
  await prisma.$transaction(async (tx) => {
    const data = {
      title: input.title,
      description: input.description,
      date: fromDateOnly(input.date),
      endDate: input.endDate ? fromDateOnly(input.endDate) : null,
      location: input.location,
      feePerChild: input.feePerChild,
      status: input.status,
      coverGradient: input.coverGradient,
      coverImage: input.coverImage,
    };
    const existing = await tx.schoolEvent.findUnique({ where: { id } });
    if (existing) {
      await tx.schoolEvent.update({ where: { id }, data });
    } else {
      await tx.schoolEvent.create({ data: { id, ...data } });
    }

    if (input.documentation) {
      await tx.eventDoc.deleteMany({ where: { eventId: id } });
      for (const d of input.documentation) {
        await tx.eventDoc.create({
          data: {
            id: d.id,
            eventId: id,
            caption: d.caption,
            type: d.type,
            color: d.color,
            imageUrl: d.imageUrl ?? null,
            createdAt: fromDateOnly(d.createdAt),
          },
        });
      }
    }

    if (input.attendees) {
      await tx.eventAttendee.deleteMany({ where: { eventId: id } });
      for (const studentId of input.attendees) {
        await tx.eventAttendee.create({
          data: { eventId: id, studentId },
        });
      }
    }
  });
  return (await getEventById(id))!;
}

export async function listRegistrations(): Promise<RegistrationApplication[]> {
  const rows = await prisma.registrationApplication.findMany({
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(mapRegistration);
}

export async function getRegistrationById(
  id: string,
): Promise<RegistrationApplication | null> {
  const row = await prisma.registrationApplication.findUnique({ where: { id } });
  return row ? mapRegistration(row) : null;
}

export async function getRegistrationByToken(
  token: string,
): Promise<RegistrationApplication | null> {
  const row = await prisma.registrationApplication.findUnique({
    where: { formToken: token },
  });
  return row ? mapRegistration(row) : null;
}

export async function upsertRegistration(
  input: RegistrationApplication,
): Promise<RegistrationApplication> {
  const data = {
    status: input.status,
    submittedAt: new Date(input.submittedAt),
    notes: input.notes ?? null,
    parentId: input.parentId ?? null,
    parentIds: jsonOrUndef(input.parentIds),
    parent: input.parent as Prisma.InputJsonValue,
    parents: jsonOrUndef(input.parents),
    child: input.child as Prisma.InputJsonValue,
    formToken: input.formToken ?? null,
    formSentAt: input.formSentAt ? new Date(input.formSentAt) : null,
    detailedForm: jsonOrUndef(input.detailedForm),
    detailedFormSubmittedAt: input.detailedFormSubmittedAt
      ? new Date(input.detailedFormSubmittedAt)
      : null,
    registrationFee: jsonOrUndef(input.registrationFee),
    enrolledStudentId: input.enrolledStudentId ?? null,
    enrolledAt: input.enrolledAt ? new Date(input.enrolledAt) : null,
  };
  const existing = await prisma.registrationApplication.findUnique({
    where: { id: input.id },
  });
  if (existing) {
    return mapRegistration(
      await prisma.registrationApplication.update({
        where: { id: input.id },
        data,
      }),
    );
  }
  return mapRegistration(
    await prisma.registrationApplication.create({
      data: { id: input.id, ...data },
    }),
  );
}
