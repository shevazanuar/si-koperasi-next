import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import SweetAlertTrigger from "@/components/dashboard/SweetAlertTrigger";

export default async function DashboardLayout({ children }) {
  const user = await getSession();

  // Fetch akses menu berdasarkan level_id user dari session
  let allowedMenuIds = null;
  if (user?.level_id) {
    const level = await prisma.level.findUnique({
      where: { id: user.level_id },
    });
    if (level?.akses) {
      allowedMenuIds = level.akses
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter(Boolean);
    }
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <SweetAlertTrigger />
      <Sidebar role={user?.role} allowedMenuIds={allowedMenuIds} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}