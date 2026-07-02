import { getSession } from "@/lib/session";
import InformasiClient from "./InformasiClient";

export default async function InformasiPage() {
  const user = await getSession();
  
  return <InformasiClient userRole={user?.role} />;
}
