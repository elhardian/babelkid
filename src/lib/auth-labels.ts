import type { Role } from "@/lib/types";

export function roleLabel(role: Role) {
  switch (role) {
    case "owner":
      return "Pemilik";
    case "admin":
      return "Admin";
    case "teacher":
      return "Guru";
    case "parent":
      return "Orang tua";
    default:
      return role;
  }
}
