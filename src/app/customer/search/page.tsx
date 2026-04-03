"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Chain { chainid: number; chainname: string; }
interface Hotel {
  hotelid: number; hotelname: string; address: string; starcount: number;
  chainname: string; email: string; actual_room_count: number;
}
interface Room {
  roomid: number; price: string; capacity: number; viewtype: string | null;
  extendability: boolean; bookingstatus: string;
  amenities: string[]; damages: string[];
}
interface BookingTarget { room: Room; hotel: Hotel; }

export default function SearchPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [chains, setChains] = useState<Chain[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [hotelRooms, setHotelRooms] = useState<Record<number, Room[]>>({});
  const [loadingRooms, setLoadingRooms] = useState<number | null>(null);

  // Hotel-level filters
  const [chainId, setChainId] = useState("");
  const [area, setArea] = useState("");
  const [starCount, setStarCount] = useState("");

  // Room-level filters (applied when expanding a hotel)
  const [capacity, setCapacity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Booking modal state
  const [target, setTarget] = useState<BookingTarget | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    if (session.role !== "customer") { router.push("/employee/checkin"); return; }
    fetch("/api/hotels?chains=true")
      .then(r => r.json())
      .then(data => setChains(Array.isArray(data) ? data : []));
    loadHotels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadHotels = useCallback(async () => {
    const params = new URLSearchParams();
    if (chainId) params.set("chainId", chainId);
    const res = await fetch(`/api/hotels?${params}`);
    const data = await res.json();
    let list: Hotel[] = Array.isArray(data) ? data : [];
    // Client-side filter by area and stars (simple)
    if (area) list = list.filter(h => h.address.toLowerCase().includes(area.toLowerCase()));
    if (starCount) list = list.filter(h => h.starcount === Number(starCount));
    setHotels(list);
    setExpandedHotel(null);
    setHotelRooms({});
  }, [chainId, area, starCount]);

  const toggleHotel = async (hotelId: number) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
      return;
    }
    setExpandedHotel(hotelId);
    if (hotelRooms[hotelId]) return; // already loaded

    setLoadingRooms(hotelId);
    const params = new URLSearchParams({ hotelId: String(hotelId) });
    if (capacity) params.set("capacity", capacity);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const res = await fetch(`/api/rooms?${params}`);
    const data = await res.json();
    setHotelRooms(prev => ({ ...prev, [hotelId]: Array.isArray(data) ? data : [] }));
    setLoadingRooms(null);
  };

  const openBooking = (room: Room, hotel: Hotel) => {
    setTarget({ room, hotel });
    setCheckIn(""); setCheckOut("");
    setBookingMsg(""); setBookingSuccess(false);
  };

  const submitBooking = async () => {
    if (!checkIn || !checkOut) { setBookingMsg("Enter check-in and check-out dates."); return; }
    if (checkOut <= checkIn) { setBookingMsg("Check-out must be after check-in."); return; }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomid: target!.room.roomid,
        customerid: session!.id,
        startdate: checkIn,
        enddate: checkOut,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBookingMsg(`Booking #${data.bookingid} confirmed!`);
      setBookingSuccess(true);
      // Invalidate cached rooms so status refreshes on next expand
      setHotelRooms(prev => {
        const updated = { ...prev };
        delete updated[target!.hotel.hotelid];
        return updated;
      });
    } else if (res.status === 409) {
      setBookingMsg("Already booked — this room is reserved for those dates.");
    } else {
      setBookingMsg(data.error ?? "Booking failed.");
    }
  };

  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find a Room</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Chain</label>
          <select className="w-full border rounded p-2 text-sm" value={chainId} onChange={e => setChainId(e.target.value)}>
            <option value="">All Chains</option>
            {chains.map(c => <option key={c.chainid} value={c.chainid}>{c.chainname}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">City / Area</label>
          <input className="w-full border rounded p-2 text-sm" placeholder="e.g. Ottawa"
            value={area} onChange={e => setArea(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Stars</label>
          <select className="w-full border rounded p-2 text-sm" value={starCount} onChange={e => setStarCount(e.target.value)}>
            <option value="">Any</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Min Capacity</label>
          <select className="w-full border rounded p-2 text-sm" value={capacity} onChange={e => setCapacity(e.target.value)}>
            <option value="">Any</option>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Max Price ($)</label>
          <input type="number" className="w-full border rounded p-2 text-sm" placeholder="∞"
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div>
          <button onClick={loadHotels}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Search Hotels
          </button>
        </div>
      </div>

      {/* Hotel list */}
      {hotels.length === 0 && <p className="text-gray-500 text-center py-12">No hotels found.</p>}
      <div className="space-y-3">
        {hotels.map(h => (
          <div key={h.hotelid} className="bg-white rounded-xl shadow overflow-hidden">
            {/* Hotel header — click to expand */}
            <button
              onClick={() => toggleHotel(h.hotelid)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-base">{h.hotelname}</p>
                <p className="text-sm text-gray-500">{h.address}</p>
                <p className="text-xs text-gray-400 mt-0.5">{h.chainname} · {"★".repeat(h.starcount)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{h.actual_room_count} room{h.actual_room_count !== 1 ? "s" : ""}</span>
                <span className="text-gray-400 text-lg">{expandedHotel === h.hotelid ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Rooms — shown when expanded */}
            {expandedHotel === h.hotelid && (
              <div className="border-t px-4 pb-4 pt-3 bg-gray-50">
                {loadingRooms === h.hotelid && <p className="text-sm text-gray-400">Loading rooms…</p>}
                {!loadingRooms && hotelRooms[h.hotelid]?.length === 0 && (
                  <p className="text-sm text-gray-400">No rooms match your filters.</p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
                  {(hotelRooms[h.hotelid] ?? []).map(r => (
                    <div key={r.roomid} className="bg-white rounded-lg border p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Room #{r.roomid}</p>
                          <p className="text-xs text-gray-500">{r.capacity} guest{r.capacity > 1 ? "s" : ""}
                            {r.viewtype ? ` · ${r.viewtype} view` : ""}
                            {r.extendability ? " · Extendable" : ""}
                          </p>
                        </div>
                        <span className="text-blue-700 font-bold">${Number(r.price).toFixed(0)}<span className="text-xs font-normal">/night</span></span>
                      </div>

                      {/* Amenities */}
                      {r.amenities?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Amenities</p>
                          <div className="flex flex-wrap gap-1">
                            {r.amenities.map(a => (
                              <span key={a} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Damages */}
                      {r.damages?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-500 mb-0.5">Known Issues</p>
                          <div className="flex flex-wrap gap-1">
                            {r.damages.map(d => (
                              <span key={d} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => openBooking(r, h)}
                        className="mt-auto bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">
                        Book Room
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {target && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-1">Book Room #{target.room.roomid}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {target.hotel.hotelname} · {target.room.capacity} guest{target.room.capacity > 1 ? "s" : ""}
              {target.room.viewtype ? ` · ${target.room.viewtype} view` : ""}
              · ${Number(target.room.price).toFixed(0)}/night
            </p>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">Booking as <span className="font-medium text-gray-700">{session?.name}</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in</label>
                  <input type="date" className="w-full border rounded p-2 text-sm"
                    value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out</label>
                  <input type="date" className="w-full border rounded p-2 text-sm"
                    value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                </div>
              </div>
            </div>

            {bookingMsg && (
              <p className={`mt-3 text-sm font-medium ${bookingSuccess ? "text-green-600" : "text-red-500"}`}>
                {bookingMsg}
              </p>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setTarget(null)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              {!bookingSuccess && (
                <button onClick={submitBooking} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
