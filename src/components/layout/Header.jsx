import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import { getSession, destroySession } from "@/lib/session";
import MobileMenuButton from "./MobileMenuButton";
import NotificationBell from "./NotificationBell";

export default async function Header() {
  const session = await getSession();
  const user = session ?? { name: "User", role: "guest" };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center">
        <MobileMenuButton />
        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Overview</h2>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell role={user.role} />

        <div className="h-8 w-px bg-gray-200"></div>

        <Link href="/dashboard/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-2xl transition-colors group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none group-hover:text-amber-700 transition-colors">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
            <UserIcon className="w-5 h-5" />
          </div>
        </Link>

        <form
          action={async () => {
            "use server";
            await destroySession();
            redirect("/login");
          }}
        >
          <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:block">Keluar</span>
          </button>
        </form>
      </div>
    </header>
  );
}
