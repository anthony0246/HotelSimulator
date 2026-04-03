"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Renting {
  rentingid: number;
  startdate: string;
  enddate: string;
  paid: boolean;
  roomid: number;
  price: string;
  capacity: number;
  viewtype: string | null;
  hotelname: string;
  address: string;
  chainname: string;
  sourcedbookingid: number | null;
}

export default function MyCheckInsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [rentings, setRentings] = useState<Renting[]>([]);

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    if (session.role !== "customer") { router.push("/employee/checkin"); return; }

    fetch(`/api/rentings?customerId=${session.id}`)
      .then(r => r.json())
      .then(data => setRentings(Array.isArray(data) ? data : []));
  }, [session, router]);

  if (!session) return null;

  const today = new Date().toISOString().slice(0, 10);
  const active = rentings.filter(r => r.enddate.slice(0, 10) >= today);
  const past   = rentings.filter(r => r.enddate.slice(0, 10) <  today);

  const statusBadge = (r: Renting) => {
    if (r.enddate.slice(0, 10) < today)
      return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Past Stay</span>;
    if (r.startdate.slice(0, 10) <= today)
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active Stay</span>;
    return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Upcoming</span>;
  };

  const RentingCard = ({ r }: { r: Renting }) => (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
      <div className="space-y-0.5">
        <p className="font-semibold">{r.hotelname} <span className="text-gray-400 text-xs">({r.chainname})</span></p>
        <p className="text-sm text-gray-500">{r.address}</p>
        <p className="text-sm">
          Room #{r.roomid} · {r.capacity} guest{r.capacity > 1 ? "s" : ""}
          {r.viewtype ? ` · ${r.viewtype} view` : ""} · ${Number(r.price).toFixed(0)}/night
        </p>
        <p className="text-sm text-gray-500">
          {r.startdate.slice(0, 10)} → {r.enddate.slice(0, 10)}
        </p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {statusBadge(r)}
          {r.paid
            ? <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">Paid</span>
            : <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">Payment Pending</span>
          }
          {r.sourcedbookingid &&
            <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">From Booking #{r.sourcedbookingid}</span>
          }
        </div>
      </div>
      <span className="text-xs text-gray-400 shrink-0 ml-4">Renting #{r.rentingid}</span>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Check-ins</h1>
      <p className="text-sm text-gray-500 mb-6">Active and past stays for {session.name}</p>

      {rentings.length === 0 && (
        <p className="text-gray-500">No check-ins found.</p>
      )}

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Active &amp; Upcoming</h2>
          <div className="space-y-3">
            {active.map(r => <RentingCard key={r.rentingid} r={r} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Past Stays</h2>
          <div className="space-y-3">
            {past.map(r => <RentingCard key={r.rentingid} r={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
