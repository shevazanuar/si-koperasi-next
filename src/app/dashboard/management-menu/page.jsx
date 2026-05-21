import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ManagementMenuPage from "./ManagementMenuClient";

export default async function Page() {
  const user = await getSession();
  if (!user || user.role !== "admin" || user.id !== 1) {
    redirect("/dashboard");
  }

  return <ManagementMenuPage />;
}
