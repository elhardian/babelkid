"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { enrollStudentFromRegistration } from "@/components/dashboard/StudentsProvider";
import { upsertParentFromStore } from "@/components/dashboard/ParentsProvider";
import { getTeacherFromStore } from "@/components/dashboard/TeachersProvider";
import { classes as seedClasses } from "@/lib/mock-data";
import type {
  RegistrationApplication,
  RegistrationDetailedForm,
  RegistrationFeePayment,
  RegistrationStatus,
  Student,
} from "@/lib/types";

const STORAGE_KEY = "babelkids.registrations.v2";

const seed: RegistrationApplication[] = [
  {
    id: "reg-demo-1",
    status: "pending",
    submittedAt: "2026-09-14T08:30:00+07:00",
    parent: {
      name: "Dewi Lestari",
      relationship: "mother",
      phone: "081234567890",
      email: "dewi.lestari@email.com",
      address: "Jl. Melati No. 12, Bandung",
      occupation: "Designer",
    },
    parents: [
      {
        name: "Dewi Lestari",
        relationship: "mother",
        phone: "081234567890",
        email: "dewi.lestari@email.com",
        address: "Jl. Melati No. 12, Bandung",
        occupation: "Designer",
      },
      {
        name: "Budi Lestari",
        relationship: "father",
        phone: "081234567891",
        email: "budi.lestari@email.com",
        address: "Jl. Melati No. 12, Bandung",
        occupation: "Engineer",
      },
    ],
    child: {
      name: "Nina Lestari",
      nickname: "Nina",
      dateOfBirth: "2022-04-18",
      gender: "female",
      preferredClassId: "c1",
      allergies: "Kacang",
    },
  },
  {
    id: "reg-demo-2",
    status: "form_sent",
    submittedAt: "2026-09-18T10:15:00+07:00",
    formToken: "demo-form-token-2",
    formSentAt: "2026-09-19T09:00:00+07:00",
    parentId: "p-demo-1",
    parent: {
      name: "Rina Wijaya",
      relationship: "mother",
      phone: "081298765432",
      email: "rina.wijaya@email.com",
      address: "Jl. Melati No. 5, Pangkalpinang",
      occupation: "Guru",
    },
    parents: [
      {
        name: "Rina Wijaya",
        relationship: "mother",
        phone: "081298765432",
        email: "rina.wijaya@email.com",
        address: "Jl. Melati No. 5, Pangkalpinang",
        occupation: "Guru",
      },
    ],
    child: {
      name: "Bima Wijaya",
      nickname: "Bima",
      dateOfBirth: "2021-11-02",
      gender: "male",
      preferredClassId: "c2",
    },
  },
  {
    id: "reg-demo-3",
    status: "form_submitted",
    submittedAt: "2026-09-21T14:40:00+07:00",
    formToken: "demo-form-token-3",
    formSentAt: "2026-09-21T16:00:00+07:00",
    detailedFormSubmittedAt: "2026-09-22T11:20:00+07:00",
    parent: {
      name: "Hendra Saputra",
      relationship: "father",
      phone: "081566677788",
      email: "hendra.saputra@email.com",
      address: "Jl. Sudirman No. 9, Pangkalpinang",
      occupation: "Dokter",
    },
    parents: [
      {
        name: "Sinta Saputra",
        relationship: "mother",
        phone: "081566677789",
        email: "sinta.saputra@email.com",
        address: "Jl. Sudirman No. 9, Pangkalpinang",
        occupation: "Ibu rumah tangga",
      },
      {
        name: "Hendra Saputra",
        relationship: "father",
        phone: "081566677788",
        email: "hendra.saputra@email.com",
        address: "Jl. Sudirman No. 9, Pangkalpinang",
        occupation: "Dokter",
      },
    ],
    child: {
      name: "Kara Saputra",
      nickname: "Kara",
      dateOfBirth: "2022-08-30",
      gender: "female",
      preferredClassId: "c1",
      notes: "Butuh kelas setengah hari",
    },
  },
  {
    id: "reg-demo-4",
    status: "pending",
    submittedAt: "2026-09-23T07:50:00+07:00",
    parentId: "p-demo-2",
    parent: {
      name: "Andi Pratama",
      relationship: "father",
      phone: "081355512345",
      email: "andi.pratama@email.com",
      address: "Jl. Merdeka No. 21, Pangkalpinang",
      occupation: "Wiraswasta",
    },
    child: {
      name: "Lara Pratama",
      nickname: "Lara",
      dateOfBirth: "2020-03-12",
      gender: "female",
      preferredClassId: "c3",
      allergies: "Susu sapi",
    },
  },
];

const SERVER_SNAPSHOT: RegistrationApplication[] = seed;

function readStorage(): RegistrationApplication[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrationApplication[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(rows: RegistrationApplication[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

let store: RegistrationApplication[] = [...seed];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const saved = readStorage();
  if (saved) store = saved;
  else writeStorage(store);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrateFromStorage();
  queueMicrotask(() => {
    hydrateFromStorage();
    listener();
  });
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrateFromStorage();
  return store;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function setStore(
  next:
    | RegistrationApplication[]
    | ((prev: RegistrationApplication[]) => RegistrationApplication[]),
) {
  hydrateFromStorage();
  store = typeof next === "function" ? next(store) : next;
  writeStorage(store);
  emit();
}

function createApplication(
  input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
): RegistrationApplication {
  return {
    ...input,
    id: `reg-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

function randomToken() {
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function patchApp(
  id: string,
  patch: Partial<RegistrationApplication> | ((a: RegistrationApplication) => RegistrationApplication),
) {
  setStore((prev) =>
    prev.map((a) => {
      if (a.id !== id) return a;
      return typeof patch === "function" ? patch(a) : { ...a, ...patch };
    }),
  );
}

interface RegistrationContextValue {
  applications: RegistrationApplication[];
  submit: (
    input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
  ) => RegistrationApplication;
  updateStatus: (id: string, status: RegistrationStatus, notes?: string) => void;
  generateFormLink: (id: string) => { token: string; path: string };
  submitDetailedForm: (
    token: string,
    form: RegistrationDetailedForm,
  ) => RegistrationApplication | null;
  recordFee: (
    id: string,
    fee: Omit<RegistrationFeePayment, "recordedAt" | "status"> & {
      status?: RegistrationFeePayment["status"];
    },
  ) => void;
  enroll: (id: string, classId?: string) => Student | null;
  getByToken: (token: string) => RegistrationApplication | undefined;
  pendingCount: number;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(
  null,
);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const applications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const submit = useCallback(
    (
      input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
    ) => {
      const row = createApplication(input);
      setStore((prev) => [row, ...prev]);
      return row;
    },
    [],
  );

  const updateStatus = useCallback(
    (id: string, status: RegistrationStatus, notes?: string) => {
      patchApp(id, (a) => ({
        ...a,
        status,
        notes: notes ?? a.notes,
      }));
    },
    [],
  );

  const generateFormLink = useCallback((id: string) => {
    const existing = store.find((a) => a.id === id);
    const token = existing?.formToken || randomToken();
    patchApp(id, {
      formToken: token,
      formSentAt: new Date().toISOString(),
      status: "form_sent",
    });
    return { token, path: `/register/form/${token}` };
  }, []);

  const submitDetailedForm = useCallback(
    (token: string, form: RegistrationDetailedForm) => {
      const app = store.find((a) => a.formToken === token);
      if (!app) return null;
      if (
        app.status === "approved" ||
        app.status === "rejected" ||
        app.status === "form_submitted" ||
        app.detailedFormSubmittedAt
      ) {
        return null;
      }
      const updated: RegistrationApplication = {
        ...app,
        detailedForm: form,
        detailedFormSubmittedAt: new Date().toISOString(),
        status: "form_submitted",
        child: {
          ...app.child,
          name: form.student.fullName || app.child.name,
          nickname: form.student.nickname || app.child.nickname,
          dateOfBirth: form.student.dateOfBirth || app.child.dateOfBirth,
          gender: form.student.gender || app.child.gender,
          allergies:
            form.childInfo.allergiesHealth || app.child.allergies,
        },
      };
      setStore((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
      return updated;
    },
    [],
  );

  const recordFee = useCallback(
    (
      id: string,
      fee: Omit<RegistrationFeePayment, "recordedAt" | "status"> & {
        status?: RegistrationFeePayment["status"];
      },
    ) => {
      patchApp(id, {
        registrationFee: {
          amount: fee.amount,
          method: fee.method,
          proofUrl: fee.proofUrl,
          note: fee.note,
          recordedBy: fee.recordedBy ?? "Admin",
          status: fee.status ?? (fee.proofUrl ? "pending" : "recorded"),
          recordedAt: new Date().toISOString(),
        },
      });
    },
    [],
  );

  const enroll = useCallback((id: string, classId?: string) => {
    const app = store.find((a) => a.id === id);
    if (!app) return null;
    if (app.enrolledStudentId) return null;

    const parentsList = app.parents?.length ? app.parents : [app.parent];
    const savedParents = parentsList.map((p) =>
      upsertParentFromStore({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email,
        address: p.address,
        occupation: p.occupation,
      }),
    );

    const clsId =
      classId || app.child.preferredClassId || seedClasses[0]?.id || "c1";
    const cls = seedClasses.find((c) => c.id === clsId);
    const teacher = cls ? getTeacherFromStore(cls.teacherId) : undefined;
    const enrollmentDate = new Date().toISOString().slice(0, 10);
    const colors = ["#F4A261", "#2E7DFF", "#E9C46A", "#2A9D8F", "#E76F51"];

    const student = enrollStudentFromRegistration({
      name: app.detailedForm?.student.fullName || app.child.name,
      nickname: app.detailedForm?.student.nickname || app.child.nickname,
      dateOfBirth:
        app.detailedForm?.student.dateOfBirth || app.child.dateOfBirth,
      gender: app.detailedForm?.student.gender || app.child.gender,
      classId: clsId,
      status: "active",
      enrollmentDate,
      photoColor: colors[Math.floor(Math.random() * colors.length)],
      allergies:
        app.detailedForm?.childInfo.allergiesHealth || app.child.allergies,
      notes: app.detailedForm?.childInfo.otherNotes || app.child.notes,
      parents: savedParents.map((p) => ({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email,
      })),
      classHistory: cls
        ? [
            {
              id: `ch-${Date.now()}`,
              classId: cls.id,
              className: cls.name,
              level: cls.level,
              teacherName: teacher?.name ?? "—",
              startDate: enrollmentDate,
            },
          ]
        : [],
    });

    patchApp(id, {
      status: "approved",
      enrolledStudentId: student.id,
      enrolledAt: new Date().toISOString(),
    });

    return student;
  }, []);

  const getByToken = useCallback(
    (token: string) => applications.find((a) => a.formToken === token),
    [applications],
  );

  const value = useMemo(
    () => ({
      applications,
      submit,
      updateStatus,
      generateFormLink,
      submitDetailedForm,
      recordFee,
      enroll,
      getByToken,
      pendingCount: applications.filter(
        (a) =>
          a.status === "pending" ||
          a.status === "reviewing" ||
          a.status === "form_sent" ||
          a.status === "form_submitted",
      ).length,
    }),
    [
      applications,
      submit,
      updateStatus,
      generateFormLink,
      submitDetailedForm,
      recordFee,
      enroll,
      getByToken,
    ],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrations() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error("useRegistrations must be used within RegistrationProvider");
  }
  return ctx;
}

export function submitRegistration(
  input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
) {
  const row = createApplication(input);
  setStore((prev) => [row, ...prev]);
  return row;
}

export function getRegistrationByToken(token: string) {
  hydrateFromStorage();
  return store.find((a) => a.formToken === token);
}

export function submitDetailedFormByToken(
  token: string,
  form: RegistrationDetailedForm,
) {
  hydrateFromStorage();
  const app = store.find((a) => a.formToken === token);
  if (!app) return null;
  if (
    app.status === "approved" ||
    app.status === "rejected" ||
    app.status === "form_submitted" ||
    app.detailedFormSubmittedAt
  ) {
    return null;
  }
  const updated: RegistrationApplication = {
    ...app,
    detailedForm: form,
    detailedFormSubmittedAt: new Date().toISOString(),
    status: "form_submitted",
    child: {
      ...app.child,
      name: form.student.fullName || app.child.name,
      nickname: form.student.nickname || app.child.nickname,
      dateOfBirth: form.student.dateOfBirth || app.child.dateOfBirth,
      gender: form.student.gender || app.child.gender,
      allergies: form.childInfo.allergiesHealth || app.child.allergies,
    },
  };
  setStore((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
  return updated;
}

export function useRegistrationStore() {
  const applications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {
    applications,
    pendingCount: applications.filter(
      (a) => a.status === "pending" || a.status === "reviewing",
    ).length,
    submit: submitRegistration,
    getByToken: (token: string) =>
      applications.find((a) => a.formToken === token),
  };
}
