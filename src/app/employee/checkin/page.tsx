"use client";
import { useState, useEffect } from "react";

interface Booking {
  bookingid: number; startdate: string; enddate: string;
  roomid: number; price: string; capacity: number;
  hotelname: string; address: string; chainname: string;
  customerid: number; customerfirstname: string; customerlastname: string;
  checkedin: boolean;
}

export default function CheckInPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const checkIn = async () => {
    if (!employeeId || !selected) { setMsg("Enter employee ID"); return; }
    const res = await fetch("/api/rentings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomid: selected.roomid,
        customerid: selected.customerid,
        employeeid: Number(employeeId),
        startdate: selected.startdate.slice(0, 10),
        enddate: selected.enddate.slice(0, 10),
        bookingid: selected.bookingid,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Check-in complete! Renting #${data.rentingid} created.`);
      setSelected(null);
      load();
    } else {
      setMsg(data.error);
    }
  };

  const pending = bookings.filter(b => !b.checkedin);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Check-In (Booking → Renting)</h1>
      <p className="text-sm text-gray-500 mb-4">Convert a customer&apos;s existing booking to an active renting.</p>

      {pending.length === 0 && <p className="text-gray-500">No pending bookings.</p>}
      <div className="space-y-3">
        {pending.map(b => (
          <div key={b.bookingid} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{b.customerfirstname} {b.customerlastname}
                <span className="text-gray-400 text-xs ml-2">(Customer #{b.customerid})</span>
              </p>
              <p className="text-sm">{b.hotelname} · Room #{b.roomid}</p>
              <p className="text-sm text-gray-500">{b.startdate?.slice(0,10)} → {b.enddate?.slice(0,10)}</p>
            </div>
            <button onClick={() => { setSelected(b); setMsg(""); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Check In
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Confirm Check-In</h2>
            <p className="text-sm text-gray-600 mb-1">
              {selected.customerfirstname} {selected.customerlastname} · Booking #{selected.bookingid}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {selected.hotelname} Room #{selected.roomid} · {selected.startdate?.slice(0,10)} → {selected.enddate?.slice(0,10)}
            </p>
            <label className="block text-sm font-medium mb-1">Processing Employee ID</label>
            <input type="number" className="w-full border rounded p-2 mb-3"
              value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
            {msg && <p className="text-sm text-red-500 mb-2">{msg}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={checkIn} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Confirm Check-In</button>
            </div>
          </div>
        </div>
      )}
      {msg && !selected && <p className="mt-4 text-green-600 font-medium">{msg}</p>}
    </div>
  );
}
