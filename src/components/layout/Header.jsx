import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import { getSession, destroySession } from "@/lib/session";

export default async function Header() {
  const session = await getSession();
  const user = session ?? { name: "User", role: "guest" };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Overview</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        <Link href="/dashboard/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-2xl transition-colors group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
            <UserIcon className="w-5 h-5" />
          </div>
        </Link>

        <form action={async () => {
          "use server";
          await destroySession();
          redirect("/login");
        }}>
          <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </header>
  );
}