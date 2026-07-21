export type Role = "admin" | "owner" | "teacher" | "parent";

export type StudentStatus = "active" | "inactive" | "alumni";

export type TuitionStatus = "paid" | "pending" | "overdue" | "submitted";

export type PaymentMethod = "transfer" | "tunai" | "whatsapp";

export type PaymentProofStatus = "pending" | "approved" | "rejected";

export type PresenceStatus = "present" | "absent" | "late" | "excused";

export type EventStatus = "upcoming" | "ongoing" | "past";

export interface Parent {
  id: string;
  name: string;
  relationship: "mother" | "father" | "guardian";
  phone: string;
  email: string;
}

export interface ClassPlacement {
  id: string;
  classId: string;
  className: string;
  level: "preschool" | "kindergarten";
  teacherName: string;
  startDate: string;
  endDate?: string;
  note?: string;
}

export interface Student {
  id: string;
  name: string;
  nickname: string;
  dateOfBirth: string;
  gender: "male" | "female";
  classId: string;
  status: StudentStatus;
  enrollmentDate: string;
  parents: Parent[];
  photoColor: string;
  allergies?: string;
  notes?: string;
  classHistory: ClassPlacement[];
}

export interface SchoolClass {
  id: string;
  name: string;
  level: "preschool" | "kindergarten";
  teacherId: string;
  capacity: number;
  room: string;
  schedule: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "teacher" | "admin" | "owner";
}

export interface TuitionRecord {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  status: TuitionStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  proofUrl?: string;
  proofStatus?: PaymentProofStatus;
  note?: string;
  recordedBy?: string;
}

export interface ActivityPost {
  id: string;
  eventId: string;
  eventName: string;
  description: string;
  date: string;
  images: string[];
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  feePerChild: number;
  status: EventStatus;
  coverGradient: string;
  coverImage: string;
  documentation: EventDoc[];
  attendees: string[];
}

export interface EventDoc {
  id: string;
  caption: string;
  type: "photo" | "note" | "video";
  color: string;
  imageUrl?: string;
  createdAt: string;
}

export interface PresenceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: PresenceStatus;
  note?: string;
  recordedBy: string;
}

export interface StudentReport {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  title: string;
  mood: "happy" | "ok" | "tired" | "upset";
  activities: string;
  meals: string;
  naps: string;
  notes: string;
  skills: string[];
}

export interface FinanceSummary {
  month: string;
  tuitionCollected: number;
  tuitionPending: number;
  eventFees: number;
  expenses: number;
}

export type KasAccount = "cash" | "bank";

export interface KasEntry {
  id: string;
  date: string;
  type: "in" | "out";
  account: KasAccount;
  source:
    | "tuition"
    | "event"
    | "donation"
    | "gift"
    | "sponsor"
    | "expense"
    | "other";
  amount: number;
  note: string;
  recordedBy: string;
  /** Link to tuition record when sourced from tuition approval */
  tuitionId?: string;
}
