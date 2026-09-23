import type {
  RegistrationApplication,
  RegistrationDetailedForm,
  RegistrationParent,
} from "@/lib/types";

function emptyAdult() {
  return {
    name: "",
    homeAddress: "",
    email: "",
    homePhone: "",
    cellPhone: "",
    occupation: "",
    businessName: "",
    officeAddress: "",
    businessPhone: "",
  };
}

export function emptyDetailedForm(): RegistrationDetailedForm {
  return {
    student: {
      fullName: "",
      nickname: "",
      tshirtSize: "",
      gender: "female",
      placeOfBirth: "",
      dateOfBirth: "",
      homeAddress: "",
      homePhone: "",
      cellPhone: "",
    },
    maritalStatus: "married",
    custodyNote: "",
    father: emptyAdult(),
    mother: emptyAdult(),
    emergency: {
      name: "",
      homeAddress: "",
      email: "",
      homePhone: "",
      cellPhone: "",
      relationship: "",
    },
    childInfo: {
      fears: "",
      householdMembers: "",
      playsWithOthers: "",
      imaginaryFriend: "",
      habits: "",
      behaviourDifficulties: "",
      pets: "",
      languages: "",
      speechDifficulties: "",
      allergiesHealth: "",
      beenAwayFromParents: "",
      preschoolGoals: "",
      otherNotes: "",
    },
    tuitionResponsible: {
      name: "",
      homeAddress: "",
      email: "",
      homePhone: "",
      cellPhone: "",
    },
    declarationSigned: false,
    declarationDate: new Date().toISOString().slice(0, 10),
    signedBy: "",
    signatureDataUrl: undefined,
  };
}

function findByRel(
  parents: RegistrationParent[],
  rel: RegistrationParent["relationship"],
) {
  return parents.find((p) => p.relationship === rel);
}

/** Prefill detailed form from public registration application */
export function autofillDetailedForm(
  app: RegistrationApplication,
): RegistrationDetailedForm {
  const base = emptyDetailedForm();
  const parents = app.parents?.length ? app.parents : [app.parent];
  const mother = findByRel(parents, "mother") ?? parents[0];
  const father =
    findByRel(parents, "father") ??
    (parents.length > 1 ? parents.find((p) => p !== mother) : undefined);
  const primary = mother ?? app.parent;

  base.student = {
    fullName: app.child.name,
    nickname: app.child.nickname,
    tshirtSize: "",
    gender: app.child.gender,
    placeOfBirth: "",
    dateOfBirth: app.child.dateOfBirth,
    homeAddress: primary.address ?? "",
    homePhone: "",
    cellPhone: primary.phone ?? "",
  };

  if (mother) {
    base.mother = {
      ...emptyAdult(),
      name: mother.name,
      homeAddress: mother.address,
      email: mother.email,
      cellPhone: mother.phone,
      occupation: mother.occupation ?? "",
    };
  }
  if (father) {
    base.father = {
      ...emptyAdult(),
      name: father.name,
      homeAddress: father.address,
      email: father.email,
      cellPhone: father.phone,
      occupation: father.occupation ?? "",
    };
  }

  base.tuitionResponsible = {
    name: primary.name,
    homeAddress: primary.address,
    email: primary.email,
    homePhone: "",
    cellPhone: primary.phone,
  };

  base.childInfo.allergiesHealth = app.child.allergies ?? "";
  base.childInfo.otherNotes = app.child.notes ?? "";
  base.signedBy = primary.name;
  return base;
}

export function formatAgeRange(min: number, max: number) {
  if (min === max) return `${min} thn`;
  return `${min}–${max} thn`;
}

export function registrationFormPath(token: string) {
  return `/register/form/${token}`;
}
