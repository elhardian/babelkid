import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ParentsLayoutClient } from "@/components/parents/ParentsLayoutClient";

export default async function ParentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.portal !== "parent") {
    redirect("/app");
  }

  return (
    <ParentsLayoutClient
      parentName={session.name}
      parentEmail={session.email}
      childIds={session.childIds}
    >
      {children}
    </ParentsLayoutClient>
  );
}
