"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Customer {
  customerid: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Room {
  roomid: number;
  price: string;
  capacity: number;
  viewtype: string | null;
  extendability: boolean;
  bookingstatus: string;
  hotelid: number;
  hotelname: string;
  address: string;
  starcount: number;
  chainname: string;
  amenities: string[];
  damages: string[];
}

export default function WalkInPage() {
  const { session } = useAuth();
  const router = useRouter();

  // Step 1: customer lookup
  const [emailInput, setEmailInput] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerErr, setCustomerErr] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  // Step 2: room search
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  // Step 3: selected room + submit
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) { router.push("/"); return; }
    if (session.role !== "employee") { router.push("/customer/search"); return; }
  }, [session, router]);

  const lookupCustomer = async () => {
    if (!emailInput.trim()) { setCustomerErr("Enter an email address."); return; }
    setLookingUp(true);
    setCustomerErr("");
    setCustomer(null);
    const res = await fetch(`/api/customers?email=${encodeURIComponent(emailInput.trim())}`);
    const data = await res.json();
    setLookingUp(false);
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      setCustomerErr("No customer found with that email.");
    } else {
      setCustomer(rows[0]);
    }
  };

  const searchRooms = async () => {
    if (!startDate || !endDate) { return; }
    if (endDate <= startDate) { return; }
    setSearching(true);
    setSearched(false);
    setSelectedRoom(null);

    const params = new URLSearchParams({ startDate, endDate });
    if (capacity) params.set("capacity", capacity);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const res = await fetch(`/api/rooms?${params}`);
    const data = await res.json();
    setRooms(Array.isArray(data) ? data : []);
    setSearching(false);
    setSearched(true);
  };

  const submit = async () => {
    if (!selectedRoom || !customer || !startDate || !endDate || !session) return;
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/rentings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomid: selectedRoom.roomid,
        customerid: customer.customerid,
        employeeid: session.id,
        startdate: startDate,
        enddate: endDate,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setMsg(`Renting #${data.rentingid} created successfully.`);
      setSuccess(true);
      setCustomer(null);
      setEmailInput("");
      setSelectedRoom(null);
      setRooms([]);
      setSearched(false);
      setStartDate("");
      setEndDate("");
    } else {
      setMsg(data.error);
      setSuccess(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Walk-In Renting</h1>
        <p className="text-sm text-gray-500">
          Customer arrived without a booking. Processing as{" "}
          <span className="font-medium text-gray-700">{session.name}</span>
          {session.hotelname && <> · {session.hotelname}</>}
        </p>
      </div>

      {/* ── Step 1: Customer lookup ── */}
      <div className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="font-semibold text-base">1. Find Customer by Email</h2>
        <div className="flex gap-2">
          <input
            type="email"
            className="flex-1 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="customer@email.com"
            value={emailInput}
            onChange={e => { setEmailInput(e.target.value); setCustomer(null); setCustomerErr(""); }}
            onKeyDown={e => e.key === "Enter" && lookupCustomer()}
          />
          <button
            onClick={lookupCustomer}
            disabled={lookingUp}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
            {lookingUp ? "Looking up…" : "Look Up"}
          </button>
        </div>
        {customerErr && <p className="text-red-500 text-sm">{customerErr}</p>}
        {customer && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
            <span className="text-green-600 font-medium">✓</span>
            <span className="font-medium">{customer.firstname} {customer.lastname}</span>
            <span className="text-gray-400 text-xs">(Customer #{customer.customerid})</span>
            <button
              onClick={() => { setCustomer(null); setEmailInput(""); }}
              className="ml-auto text-xs text-gray-400 hover:text-red-500">
              ✕ Change
            </button>
          </div>
        )}
      </div>

      {/* ── Step 2: Date + room search ── */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="font-semibold text-base">2. Search Available Rooms</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Check-In Date</label>
            <input type="date" className="w-full border rounded-lg p-2 text-sm"
              value={startDate} onChange={e => { setStartDate(e.target.value); setSearched(false); }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Check-Out Date</label>
            <input type="date" className="w-full border rounded-lg p-2 text-sm"
              value={endDate} onChange={e => { setEndDate(e.target.value); setSearched(false); }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Min. Capacity</label>
            <input type="number" min="1" className="w-full border rounded-lg p-2 text-sm"
              placeholder="Any" value={capacity} onChange={e => { setCapacity(e.target.value); setSearched(false); }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Max Price / Night</label>
            <input type="number" min="0" className="w-full border rounded-lg p-2 text-sm"
              placeholder="Any" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setSearched(false); }} />
          </div>
        </div>
        {startDate && endDate && endDate <= startDate && (
          <p className="text-red-500 text-xs">Check-out must be after check-in.</p>
        )}
        <button
          onClick={searchRooms}
          disabled={!startDate || !endDate || endDate <= startDate || searching}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
          {searching ? "Searching…" : "Search Rooms"}
        </button>

        {searched && rooms.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-2">No available rooms match your criteria.</p>
        )}

        {searched && rooms.length > 0 && (
          <div className="space-y-3 pt-1">
            {rooms.map(room => {
              const isSelected = selectedRoom?.roomid === room.roomid;
              return (
                <div
                  key={room.roomid}
                  className={`border rounded-xl p-4 transition cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
                  onClick={() => { setSelectedRoom(room); setMsg(""); setSuccess(false); }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        Room #{room.roomid} — {room.hotelname}
                        <span className="text-gray-400 text-xs ml-1">({room.chainname})</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{room.address}</p>
                      <div className="flex gap-3 text-xs text-gray-600 mt-1">
                        <span>{"★".repeat(room.starcount)}{"☆".repeat(5 - room.starcount)}</span>
                        <span>Capacity: {room.capacity}</span>
                        {room.viewtype && <span>View: {room.viewtype}</span>}
                        {room.extendability && <span className="text-green-600">Extendable</span>}
                      </div>
                      {room.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {room.amenities.map((a, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{a}</span>
                          ))}
                        </div>
                      )}
                      {room.damages?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.damages.map((d, i) => (
                            <span key={i} className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-lg font-bold text-blue-700">${Number(room.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">/ night</p>
                      <span className="text-xs text-gray-400 mt-1 block">Click to select</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirmation modal ── */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Walk-In Renting</h2>
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-right">
                  {customer
                    ? `${customer.firstname} ${customer.lastname}`
                    : <span className="text-red-500">No customer selected</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>
                <span className="font-medium">#{selectedRoom.roomid} — {selectedRoom.hotelname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chain</span>
                <span>{selectedRoom.chainname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span>{startDate} → {endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="font-semibold text-blue-700">${Number(selectedRoom.price).toFixed(2)} / night</span>
              </div>
            </div>
            {!customer && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                Please look up a customer first (Step 1) before confirming.
              </p>
            )}
            {msg && (
              <p className={`text-sm font-medium mb-3 ${success ? "text-green-600" : "text-red-500"}`}>{msg}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedRoom(null); setMsg(""); }}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !customer}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {submitting ? "Creating…" : "Create Renting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {success && msg && (
        <p className="text-green-600 font-medium text-sm">{msg}</p>
      )}
    </div>
  );
}
