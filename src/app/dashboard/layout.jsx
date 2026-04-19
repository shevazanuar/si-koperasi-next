import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }) {
  const user = await getSession();

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role={user?.role} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
