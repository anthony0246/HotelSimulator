import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-Hotels",
  description: "Hotel booking and renting system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-blue-700 text-white py-3 px-6 flex items-center gap-4 shadow">
          <a href="/" className="text-xl font-bold tracking-tight">e-Hotels</a>
          <nav className="flex gap-4 text-sm ml-4">
            <a href="/customer/search" className="hover:underline">Search Rooms</a>
            <a href="/customer/bookings" className="hover:underline">My Bookings</a>
            <a href="/employee/checkin" className="hover:underline">Check-In</a>
            <a href="/employee/walkin" className="hover:underline">Walk-In</a>
            <a href="/employee/manage" className="hover:underline">Manage</a>
            <a href="/views" className="hover:underline">Views</a>
          </nav>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
