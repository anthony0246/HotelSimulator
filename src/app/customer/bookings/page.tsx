"use client";
import { useState } from "react";

interface Booking {
  bookingid: number; startdate: string; enddate: string;
  roomid: number; price: string; capacity: number;
  hotelname: string; address: string; chainname: string;
  customerfirstname: string; customerlastname: string;
  checkedin: boolean;
}

export default function MyBookingsPage() {
  const [customerId, setCustomerId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (!customerId) return;
    const res = await fetch(`/api/bookings?customerId=${customerId}`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  const cancel = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    const res = await fetch(`/api/bookings?bookingId=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Booking cancelled and archived.");
      load();
    } else {
      const data = await res.json();
      setMsg(data.error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="flex gap-3 mb-4">
        <input type="number" placeholder="Enter your Customer ID" className="border rounded p-2 text-sm w-48"
          value={customerId} onChange={e => setCustomerId(e.target.value)} />
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Load</button>
      </div>
      {msg && <p className="text-sm text-green-600 mb-3">{msg}</p>}
      {bookings.length === 0 && customerId && <p className="text-gray-500">No bookings found.</p>}
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.bookingid} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{b.hotelname} <span className="text-gray-400 text-xs">({b.chainname})</span></p>
              <p className="text-sm text-gray-600">{b.address}</p>
              <p className="text-sm">Room #{b.roomid} · {b.capacity} guest{b.capacity>1?"s":""} · ${Number(b.price).toFixed(0)}/night</p>
              <p className="text-sm text-gray-500">{b.startdate?.slice(0,10)} → {b.enddate?.slice(0,10)}</p>
              {b.checkedin && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Checked In</span>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-gray-400">Booking #{b.bookingid}</span>
              {!b.checkedin && (
                <button onClick={() => cancel(b.bookingid)}
                  className="text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
