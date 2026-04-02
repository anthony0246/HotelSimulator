"use client";
import { useState, useEffect, useCallback } from "react";

interface Chain { chainid: number; chainname: string; }
interface Room {
  roomid: number; price: string; capacity: number; viewtype: string | null;
  extendability: boolean; bookingstatus: string;
  hotelid: number; hotelname: string; address: string; starcount: number;
  chainname: string; amenities: string[];
}

export default function SearchPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Room | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");

  const [filters, setFilters] = useState({
    startDate: "", endDate: "", capacity: "",
    area: "", chainId: "", starCount: "", minPrice: "", maxPrice: "",
  });

  useEffect(() => {
    fetch("/api/hotels?chains=true")
      .then(r => r.json())
      .then(data => setChains(Array.isArray(data) ? data : []));
  }, []);

  const search = useCallback(async () => {
    if (filters.startDate && filters.endDate && filters.endDate <= filters.startDate) {
      alert("Check-out must be after check-in");
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k === "chainId" ? "chainId" : k, v); });
    const res = await fetch(`/api/rooms?${params}`);
    const data = await res.json();
    setRooms(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters]);

  const submitBooking = async () => {
    if (!customerId) { setBookingMsg("Enter your Customer ID"); return; }
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomid: booking!.roomid,
        customerid: Number(customerId),
        startdate: filters.startDate,
        enddate: filters.endDate,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBookingMsg(`Booking #${data.bookingid} confirmed!`);
      setBooking(null);
      search();
    } else {
      setBookingMsg(data.error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Available Rooms</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow mb-6">
        <div>
          <label className="block text-xs font-medium mb-1">Check-in</label>
          <input type="date" className="w-full border rounded p-2 text-sm"
            value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Check-out</label>
          <input type="date" className="w-full border rounded p-2 text-sm"
            value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Min Capacity</label>
          <select className="w-full border rounded p-2 text-sm"
            value={filters.capacity} onChange={e => setFilters(f => ({ ...f, capacity: e.target.value }))}>
            <option value="">Any</option>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} person{n>1?"s":""}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Area / City</label>
          <input className="w-full border rounded p-2 text-sm" placeholder="e.g. Ottawa"
            value={filters.area} onChange={e => setFilters(f => ({ ...f, area: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hotel Chain</label>
          <select className="w-full border rounded p-2 text-sm"
            value={filters.chainId} onChange={e => setFilters(f => ({ ...f, chainId: e.target.value }))}>
            <option value="">Any Chain</option>
            {chains.map(c => <option key={c.chainid} value={c.chainid}>{c.chainname}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Star Rating</label>
          <select className="w-full border rounded p-2 text-sm"
            value={filters.starCount} onChange={e => setFilters(f => ({ ...f, starCount: e.target.value }))}>
            <option value="">Any Stars</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Min Price ($)</label>
          <input type="number" className="w-full border rounded p-2 text-sm" placeholder="0"
            value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Max Price ($)</label>
          <input type="number" className="w-full border rounded p-2 text-sm" placeholder="∞"
            value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
        </div>
        <div className="col-span-2 md:col-span-4 flex justify-end">
          <button onClick={search}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      {rooms.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-12">No rooms found. Adjust your filters and search.</p>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(r => (
          <div key={r.roomid} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{r.hotelname}</p>
                <p className="text-xs text-gray-500">{r.address}</p>
                <p className="text-xs text-gray-500">{r.chainname} · {"★".repeat(r.starcount)}</p>
              </div>
              <span className="text-blue-700 font-bold text-lg">${Number(r.price).toFixed(0)}<span className="text-xs font-normal">/night</span></span>
            </div>
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="bg-gray-100 px-2 py-0.5 rounded">{r.capacity} guest{r.capacity>1?"s":""}</span>
              {r.viewtype && <span className="bg-gray-100 px-2 py-0.5 rounded">{r.viewtype} view</span>}
              {r.extendability && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Extendable</span>}
            </div>
            {r.amenities?.length > 0 && (
              <p className="text-xs text-gray-500">{r.amenities.join(" · ")}</p>
            )}
            <button
              onClick={() => { setBooking(r); setBookingMsg(""); }}
              disabled={r.bookingstatus !== "Available"}
              className="mt-auto bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40">
              {r.bookingstatus === "Available" ? "Book Room" : r.bookingstatus}
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {booking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Confirm Booking</h2>
            <p className="text-sm text-gray-600 mb-1">{booking.hotelname} — Room #{booking.roomid}</p>
            <p className="text-sm text-gray-600 mb-4">
              {filters.startDate || "?"} → {filters.endDate || "?"} · ${Number(booking.price).toFixed(0)}/night
            </p>
            <label className="block text-sm font-medium mb-1">Your Customer ID</label>
            <input
              type="number" className="w-full border rounded p-2 mb-3" placeholder="e.g. 1"
              value={customerId} onChange={e => setCustomerId(e.target.value)} />
            {bookingMsg && <p className={`text-sm mb-2 ${bookingMsg.includes("confirmed") ? "text-green-600" : "text-red-500"}`}>{bookingMsg}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBooking(null)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
              <button onClick={submitBooking} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
