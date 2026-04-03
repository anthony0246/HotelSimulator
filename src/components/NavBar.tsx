"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { session, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-blue-700 text-white py-3 px-6 flex items-center gap-4 shadow">
      <Link href="/" className="text-xl font-bold tracking-tight">e-Hotels</Link>

      <nav className="flex gap-4 text-sm ml-4 flex-1">
        {session?.role === "customer" && (
          <>
            <Link href="/customer/search" className="hover:underline">Search Rooms</Link>
            <Link href="/customer/bookings" className="hover:underline">My Bookings</Link>
            <Link href="/customer/checkins" className="hover:underline">My Check-ins</Link>
            <Link href="/views" className="hover:underline">Views</Link>
          </>
        )}
        {session?.role === "employee" && (
          <>
            <Link href="/employee/checkin" className="hover:underline">Check-In</Link>
            <Link href="/employee/walkin" className="hover:underline">Walk-In</Link>
            <Link href="/employee/manage" className="hover:underline">Manage</Link>
            <Link href="/views" className="hover:underline">Views</Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3 text-sm">
        {session ? (
          <>
            <span className="opacity-80">
              {session.name}
              {session.role === "employee" && session.hotelname && (
                <span className="opacity-60 ml-1">· {session.hotelname}</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition">
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
