export type Role = "admin" | "owner" | "teacher" | "parent";

export type StudentStatus = "active" | "inactive" | "alumni";

export type TuitionStatus = "paid" | "pending" | "overdue" | "submitted";

export type PaymentMethod = "transfer" | "tunai" | "whatsapp";

export type PaymentProofStatus = "pending" | "approved" | "rejected";

export type PresenceStatus = "present" | "absent" | "late" | "excused";

export type EventStatus = "upcoming" | "ongoing" | "past";

export type DayOffType = "holiday" | "school_off" | "other";

export interface SchoolDayOff {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: DayOffType;
}

export interface Parent {
  id: string;
  name: string;
  relationship: "mother" | "father" | "guardian";
  phone: string;
  email: string;
}

/** First-class parent record in the school registry */
export interface ParentProfile extends Parent {
  address?: string;
  occupation?: string;
  notes?: string;
  createdAt: string;
}

export interface StudentDocument {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  kind: "generic";
}

export type RegistrationStatus =
  | "pending"
  | "reviewing"
  | "form_sent"
  | "form_submitted"
  | "approved"
  | "rejected";

/** Online enrollment submitted from the public registration form */
export type RegistrationParent = {
  id?: string;
  name: string;
  relationship: "mother" | "father" | "guardian";
  phone: string;
  email: string;
  address: string;
  occupation?: string;
};

export type MaritalStatus = "married" | "separated" | "divorced";

/** Full paper-style registration (shared link after admin review) */
export interface RegistrationDetailedForm {
  student: {
    fullName: string;
    nickname: string;
    tshirtSize: string;
    gender: "male" | "female";
    placeOfBirth: string;
    dateOfBirth: string;
    homeAddress: string;
    homePhone: string;
    cellPhone: string;
  };
  maritalStatus: MaritalStatus;
  custodyNote: string;
  father: {
    name: string;
    homeAddress: string;
    email: string;
    homePhone: string;
    cellPhone: string;
    occupation: string;
    businessName: string;
    officeAddress: string;
    businessPhone: string;
  };
  mother: {
    name: string;
    homeAddress: string;
    email: string;
    homePhone: string;
    cellPhone: string;
    occupation: string;
    businessName: string;
    officeAddress: string;
    businessPhone: string;
  };
  emergency: {
    name: string;
    homeAddress: string;
    email: string;
    homePhone: string;
    cellPhone: string;
    relationship: string;
  };
  childInfo: {
    fears: string;
    householdMembers: string;
    playsWithOthers: string;
    imaginaryFriend: string;
    habits: string;
    behaviourDifficulties: string;
    pets: string;
    languages: string;
    speechDifficulties: string;
    allergiesHealth: string;
    beenAwayFromParents: string;
    preschoolGoals: string;
    otherNotes: string;
  };
  tuitionResponsible: {
    name: string;
    homeAddress: string;
    email: string;
    homePhone: string;
    cellPhone: string;
  };
  declarationSigned: boolean;
  declarationDate: string;
  signedBy: string;
  /** Drawn signature as PNG data URL */
  signatureDataUrl?: string;
}

export interface RegistrationFeePayment {
  amount: number;
  method: PaymentMethod;
  proofUrl?: string;
  status: PaymentProofStatus | "recorded";
  note?: string;
  recordedAt: string;
  recordedBy?: string;
}

export interface RegistrationApplication {
  id: string;
  status: RegistrationStatus;
  submittedAt: string;
  notes?: string;
  /** @deprecated prefer parentIds / parents — kept as primary contact */
  parentId?: string;
  parentIds?: string[];
  /** Primary parent (first) — kept for public form / list compat */
  parent: RegistrationParent;
  /** All parents / guardians on this application */
  parents?: RegistrationParent[];
  child: {
    name: string;
    nickname: string;
    dateOfBirth: string;
    gender: "male" | "female";
    preferredClassId?: string;
    allergies?: string;
    notes?: string;
  };
  /** Token for parent detailed-form link */
  formToken?: string;
  formSentAt?: string;
  detailedForm?: RegistrationDetailedForm;
  detailedFormSubmittedAt?: string;
  registrationFee?: RegistrationFeePayment;
  enrolledStudentId?: string;
  enrolledAt?: string;
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
  documents?: StudentDocument[];
}

export interface SchoolClass {
  id: string;
  name: string;
  level: "preschool" | "kindergarten";
  teacherId: string;
  capacity: number;
  room: string;
  schedule: string;
  /** Inclusive age range in years (e.g. 2–3) */
  ageMinYears: number;
  ageMaxYears: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "teacher" | "admin" | "owner";
  notes?: string;
  createdAt?: string;
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

/** Daily classroom activity uploaded by teachers */
export interface ClassActivity {
  id: string;
  classId: string;
  title: string;
  description: string;
  date: string;
  teacherId?: string;
  teacherName: string;
  images: string[];
  /** Optional short clip from class (URL) — uploaded via media field */
  videoUrl?: string;
  location?: string;
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
