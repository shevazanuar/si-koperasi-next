import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Bell } from "lucide-react";

export default async function Header() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let user = { name: "User", role: "guest" };

  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch(e) {}
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        {/* Placeholder for mobile menu toggle if needed later */}
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
          const cookieStore = await cookies();
          cookieStore.delete("session");
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
