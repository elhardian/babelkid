import { prisma } from "@/lib/db";
import { fromDateOnly } from "@/lib/dates";
import {
  mapClass,
  mapParent,
  mapStudent,
  mapTeacher,
} from "@/lib/data/mappers";
import type {
  ParentProfile,
  SchoolClass,
  Student,
  Teacher,
} from "@/lib/types";

export async function listTeachers(): Promise<Teacher[]> {
  const rows = await prisma.user.findMany({
    where: { portal: "staff" },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapTeacher);
}

export async function upsertTeacher(input: {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Teacher["role"];
  jabatan?: string;
  notes?: string;
  createdAt?: string;
}): Promise<Teacher> {
  const email = input.email.trim().toLowerCase();
  const existing = input.id
    ? await prisma.user.findUnique({ where: { id: input.id } })
    : await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const row = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        email,
        phone: input.phone.trim() || null,
        role: input.role,
        jabatan: input.jabatan?.trim() || null,
        notes: input.notes?.trim() || null,
        portal: "staff",
      },
    });
    return mapTeacher(row);
  }

  const randomHash = `!disabled.${crypto.randomUUID()}`;
  const row = await prisma.user.create({
    data: {
      id: input.id,
      name: input.name.trim(),
      email,
      phone: input.phone.trim() || null,
      role: input.role,
      portal: "staff",
      jabatan: input.jabatan?.trim() || null,
      notes: input.notes?.trim() || null,
      passwordHash: randomHash,
      active: false,
    },
  });
  return mapTeacher(row);
}

export async function removeTeacher(id: string) {
  await prisma.user.delete({ where: { id } });
}

export async function listClasses(): Promise<SchoolClass[]> {
  const rows = await prisma.schoolClass.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapClass);
}

export async function upsertClass(input: {
  id?: string;
  name: string;
  level: SchoolClass["level"];
  teacherId: string;
  capacity: number;
  room: string;
  schedule: string;
  ageMinYears: number;
  ageMaxYears: number;
}): Promise<SchoolClass> {
  if (input.id) {
    const row = await prisma.schoolClass.update({
      where: { id: input.id },
      data: {
        name: input.name,
        level: input.level,
        teacherId: input.teacherId,
        capacity: input.capacity,
        room: input.room,
        schedule: input.schedule,
        ageMinYears: input.ageMinYears,
        ageMaxYears: input.ageMaxYears,
      },
    });
    return mapClass(row);
  }
  const row = await prisma.schoolClass.create({
    data: {
      name: input.name,
      level: input.level,
      teacherId: input.teacherId,
      capacity: input.capacity,
      room: input.room,
      schedule: input.schedule,
      ageMinYears: input.ageMinYears,
      ageMaxYears: input.ageMaxYears,
    },
  });
  return mapClass(row);
}

export async function assignClassTeacher(classId: string, teacherId: string) {
  const row = await prisma.schoolClass.update({
    where: { id: classId },
    data: { teacherId },
  });
  return mapClass(row);
}

export async function removeClass(id: string) {
  await prisma.schoolClass.delete({ where: { id } });
}

export async function listParents(): Promise<ParentProfile[]> {
  const rows = await prisma.parentProfile.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map(mapParent);
}

export async function upsertParent(input: {
  id?: string;
  name: string;
  relationship: ParentProfile["relationship"];
  phone: string;
  email: string;
  address?: string;
  occupation?: string;
  notes?: string;
  createdAt?: string;
}): Promise<ParentProfile> {
  const data = {
    name: input.name.trim(),
    relationship: input.relationship,
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    address: input.address?.trim() || null,
    occupation: input.occupation?.trim() || null,
    notes: input.notes?.trim() || null,
  };
  if (input.id) {
    return mapParent(
      await prisma.parentProfile.update({ where: { id: input.id }, data }),
    );
  }
  return mapParent(
    await prisma.parentProfile.create({
      data: {
        ...data,
        ...(input.createdAt
          ? { createdAt: fromDateOnly(input.createdAt) }
          : {}),
      },
    }),
  );
}

export async function removeParent(id: string) {
  await prisma.parentProfile.delete({ where: { id } });
}

const studentInclude = {
  parents: { include: { parent: true } },
  placements: true,
  documents: true,
} as const;

export async function listStudents(): Promise<Student[]> {
  const rows = await prisma.student.findMany({
    include: studentInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapStudent);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const row = await prisma.student.findUnique({
    where: { id },
    include: studentInclude,
  });
  return row ? mapStudent(row) : null;
}

export async function upsertStudent(input: {
  id?: string;
  name: string;
  nickname: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  religion?: string;
  gender: Student["gender"];
  classId: string;
  status: Student["status"];
  enrollmentDate: string;
  photoColor: string;
  allergies?: string;
  additionalContact?: string;
  notes?: string;
  parents: Student["parents"];
  classHistory?: Student["classHistory"];
  documents?: Student["documents"];
}): Promise<Student> {
  const base = {
    name: input.name.trim(),
    nickname: input.nickname.trim(),
    dateOfBirth: fromDateOnly(input.dateOfBirth),
    placeOfBirth: input.placeOfBirth?.trim() || null,
    religion: input.religion?.trim() || null,
    gender: input.gender,
    classId: input.classId,
    status: input.status,
    enrollmentDate: fromDateOnly(input.enrollmentDate),
    photoColor: input.photoColor,
    allergies: input.allergies?.trim() || null,
    additionalContact: input.additionalContact?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  const id = input.id ?? `s-${Date.now()}`;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.student.findUnique({ where: { id } });
    if (existing) {
      await tx.student.update({ where: { id }, data: base });
      await tx.studentParent.deleteMany({ where: { studentId: id } });
    } else {
      await tx.student.create({ data: { id, ...base } });
    }

    for (const p of input.parents) {
      let parentId = p.id;
      const byEmail = await tx.parentProfile.findFirst({
        where: { email: p.email.trim().toLowerCase() },
      });
      if (byEmail) {
        parentId = byEmail.id;
        await tx.parentProfile.update({
          where: { id: parentId },
          data: {
            name: p.name,
            phone: p.phone,
            relationship: p.relationship,
          },
        });
      } else if (parentId) {
        const found = await tx.parentProfile.findUnique({
          where: { id: parentId },
        });
        if (!found) {
          await tx.parentProfile.create({
            data: {
              id: parentId,
              name: p.name,
              phone: p.phone,
              email: p.email.trim().toLowerCase(),
              relationship: p.relationship,
            },
          });
        }
      } else {
        const created = await tx.parentProfile.create({
          data: {
            name: p.name,
            phone: p.phone,
            email: p.email.trim().toLowerCase(),
            relationship: p.relationship,
          },
        });
        parentId = created.id;
      }

      await tx.studentParent.create({
        data: {
          studentId: id,
          parentId: parentId!,
          relationship: p.relationship,
        },
      });
    }

    if (input.classHistory) {
      await tx.classPlacement.deleteMany({ where: { studentId: id } });
      for (const h of input.classHistory) {
        await tx.classPlacement.create({
          data: {
            id: h.id,
            studentId: id,
            classId: h.classId,
            className: h.className,
            level: h.level,
            teacherName: h.teacherName,
            startDate: fromDateOnly(h.startDate),
            endDate: h.endDate ? fromDateOnly(h.endDate) : null,
            note: h.note ?? null,
          },
        });
      }
    }
  });

  return (await getStudentById(id))!;
}
