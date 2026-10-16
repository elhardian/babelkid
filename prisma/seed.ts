import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  PrismaClient,
  AuthPortal,
  UserRole,
} from "../src/generated/prisma/client";
import {
  rosterTeachers,
  rosterClasses,
  rosterStudents,
  rosterParentProfiles,
  rosterStaffSeed,
} from "../src/lib/seed/roster";
import {
  schoolDayOffs,
  presenceRecords,
  classActivities,
  studentReports,
  tuitionRecords,
  kasEntries,
  events,
} from "../src/lib/mock-data";
import { fromDateOnly } from "../src/lib/dates";
import { rowsFromMatrix } from "../src/lib/data/mappers";
import { DEFAULT_ROLE_PERMISSIONS } from "../src/lib/role-permissions";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "babelkid",
});

const prisma = new PrismaClient({ adapter });

const roleMap: Record<string, UserRole> = {
  owner: UserRole.owner,
  admin: UserRole.admin,
  teacher: UserRole.teacher,
  parent: UserRole.parent,
};

async function clearAll() {
  const order = [
    "eventAttendee",
    "eventDoc",
    "schoolEvent",
    "kasEntry",
    "tuitionRecord",
    "studentReport",
    "classActivity",
    "presenceRecord",
    "schoolDayOff",
    "registrationApplication",
    "studentDocument",
    "classPlacement",
    "studentParent",
    "student",
    "parentProfile",
    "schoolClass",
    "rolePermission",
    "user",
  ] as const;
  for (const model of order) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any)[model].deleteMany({});
  }
  console.log("– cleared tables");
}

async function seedStaff() {
  const loginById = new Map(rosterStaffSeed.map((u) => [u.id, u]));
  for (const t of rosterTeachers) {
    const login = loginById.get(t.id);
    const passwordHash = login
      ? await bcrypt.hash(login.password, 10)
      : `!disabled.${randomBytes(16).toString("hex")}`;
    await prisma.user.create({
      data: {
        id: t.id,
        email: t.email.toLowerCase(),
        name: t.name,
        phone: t.phone,
        role: roleMap[t.role],
        portal: AuthPortal.staff,
        jabatan: t.jabatan ?? null,
        notes: t.notes ?? null,
        passwordHash,
        active: Boolean(login),
        createdAt: t.createdAt ? fromDateOnly(t.createdAt) : undefined,
      },
    });
  }
  for (const u of rosterStaffSeed) {
    console.log(`✓ login · ${u.role} · ${u.email} / ${u.password}`);
  }
}

async function seedClasses() {
  for (const c of rosterClasses) {
    await prisma.schoolClass.create({
      data: {
        id: c.id,
        name: c.name,
        level: c.level,
        teacherId: c.teacherId,
        capacity: c.capacity,
        room: c.room,
        schedule: c.schedule,
        ageMinYears: c.ageMinYears,
        ageMaxYears: c.ageMaxYears,
      },
    });
  }
  console.log(`✓ ${rosterClasses.length} classes`);
}

async function seedParents() {
  for (const p of rosterParentProfiles) {
    await prisma.parentProfile.create({
      data: {
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email.toLowerCase(),
        address: p.address ?? null,
        occupation: p.occupation ?? null,
        notes: p.notes ?? null,
        createdAt: fromDateOnly(p.createdAt),
      },
    });
  }
  console.log(`✓ ${rosterParentProfiles.length} parents`);
}

async function seedStudents() {
  for (const s of rosterStudents) {
    await prisma.student.create({
      data: {
        id: s.id,
        name: s.name,
        nickname: s.nickname,
        dateOfBirth: fromDateOnly(s.dateOfBirth),
        placeOfBirth: s.placeOfBirth ?? null,
        religion: s.religion ?? null,
        gender: s.gender,
        classId: s.classId,
        status: s.status,
        enrollmentDate: fromDateOnly(s.enrollmentDate),
        photoColor: s.photoColor,
        allergies: s.allergies ?? null,
        additionalContact: s.additionalContact ?? null,
        notes: s.notes ?? null,
      },
    });

    for (const p of s.parents) {
      const parent =
        (await prisma.parentProfile.findUnique({ where: { id: p.id } })) ??
        (await prisma.parentProfile.findFirst({
          where: { email: p.email.toLowerCase() },
        }));
      if (!parent) continue;
      await prisma.studentParent.create({
        data: {
          studentId: s.id,
          parentId: parent.id,
          relationship: p.relationship,
        },
      });
    }

    for (const h of s.classHistory ?? []) {
      await prisma.classPlacement.create({
        data: {
          id: h.id,
          studentId: s.id,
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
  console.log(`✓ ${rosterStudents.length} students`);
}

async function seedOps() {
  for (const d of schoolDayOffs) {
    await prisma.schoolDayOff.create({
      data: {
        id: d.id,
        date: fromDateOnly(d.date),
        title: d.title,
        description: d.description ?? null,
        type: d.type,
      },
    });
  }

  const staffIds = new Set(rosterTeachers.map((t) => t.id));
  for (const p of presenceRecords) {
    const recordedBy = staffIds.has(p.recordedBy) ? p.recordedBy : "t1";
    try {
      await prisma.presenceRecord.create({
        data: {
          id: p.id,
          studentId: p.studentId,
          classId: p.classId,
          date: fromDateOnly(p.date),
          status: p.status,
          note: p.note ?? null,
          recordedBy,
        },
      });
    } catch {
      /* skip invalid FK rows from demo data */
    }
  }

  for (const a of classActivities) {
    try {
      await prisma.classActivity.create({
        data: {
          id: a.id,
          classId: a.classId,
          title: a.title,
          description: a.description,
          date: fromDateOnly(a.date),
          teacherId: a.teacherId && staffIds.has(a.teacherId) ? a.teacherId : null,
          teacherName: a.teacherName,
          images: a.images,
          videoUrl: a.videoUrl ?? null,
          location: a.location ?? null,
        },
      });
    } catch {
      /* skip */
    }
  }

  for (const r of studentReports) {
    try {
      await prisma.studentReport.create({
        data: {
          id: r.id,
          studentId: r.studentId,
          teacherId: staffIds.has(r.teacherId) ? r.teacherId : "t1",
          date: fromDateOnly(r.date),
          title: r.title,
          mood: r.mood,
          activities: r.activities,
          notes: r.notes,
          skills: r.skills,
        },
      });
    } catch {
      /* skip */
    }
  }

  console.log(
    `✓ ops · dayOffs=${schoolDayOffs.length} presence=${presenceRecords.length} activities=${classActivities.length} reports=${studentReports.length}`,
  );
}

async function seedFinance() {
  for (const t of tuitionRecords) {
    try {
      await prisma.tuitionRecord.create({
        data: {
          id: t.id,
          studentId: t.studentId,
          month: t.month,
          amount: t.amount,
          status: t.status,
          dueDate: fromDateOnly(t.dueDate),
          paidAt: t.paidAt ? new Date(t.paidAt) : null,
          paymentMethod: t.paymentMethod ?? null,
          proofUrl: t.proofUrl ?? null,
          proofStatus: t.proofStatus ?? null,
          note: t.note ?? null,
          recordedBy: t.recordedBy ?? null,
        },
      });
    } catch {
      /* skip */
    }
  }
  for (const k of kasEntries) {
    try {
      await prisma.kasEntry.create({
        data: {
          id: k.id,
          date: fromDateOnly(k.date),
          type: k.type,
          account: k.account,
          source: k.source,
          amount: k.amount,
          note: k.note,
          recordedBy: k.recordedBy,
          tuitionId: k.tuitionId ?? null,
        },
      });
    } catch {
      /* skip */
    }
  }
  console.log(
    `✓ finance · tuition=${tuitionRecords.length} kas=${kasEntries.length}`,
  );
}

async function seedEvents() {
  for (const e of events) {
    await prisma.schoolEvent.create({
      data: {
        id: e.id,
        title: e.title,
        description: e.description,
        date: fromDateOnly(e.date),
        endDate: e.endDate ? fromDateOnly(e.endDate) : null,
        location: e.location,
        feePerChild: e.feePerChild,
        status: e.status,
        coverGradient: e.coverGradient,
        coverImage: e.coverImage,
      },
    });
    for (const d of e.documentation) {
      await prisma.eventDoc.create({
        data: {
          id: d.id,
          eventId: e.id,
          caption: d.caption,
          type: d.type,
          color: d.color,
          imageUrl: d.imageUrl ?? null,
          createdAt: fromDateOnly(d.createdAt),
        },
      });
    }
    for (const studentId of e.attendees) {
      try {
        await prisma.eventAttendee.create({
          data: { eventId: e.id, studentId },
        });
      } catch {
        /* skip unknown students */
      }
    }
  }
  console.log(`✓ ${events.length} events`);
}

async function seedRolePermissions() {
  const rows = rowsFromMatrix(DEFAULT_ROLE_PERMISSIONS);
  await prisma.rolePermission.createMany({ data: rows });
  console.log(`✓ ${rows.length} role permissions`);
}

async function main() {
  await clearAll();
  await seedStaff();
  await seedClasses();
  await seedParents();
  await seedStudents();
  await seedOps();
  await seedFinance();
  await seedEvents();
  await seedRolePermissions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
