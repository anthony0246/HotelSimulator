"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function WalkInPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ roomid: "", customerid: "", startdate: "", enddate: "" });
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    if (session.role !== "employee") { router.push("/customer/search"); return; }
  }, [session, router]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const { roomid, customerid, startdate, enddate } = form;
    if (!roomid || !customerid || !startdate || !enddate) {
      setMsg("All fields are required."); return;
    }
    if (enddate <= startdate) { setMsg("End date must be after start date."); return; }

    const res = await fetch("/api/rentings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomid: Number(roomid),
        customerid: Number(customerid),
        employeeid: session!.id,
        startdate,
        enddate,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Renting #${data.rentingid} created successfully.`);
      setSuccess(true);
      setForm({ roomid: "", customerid: "", startdate: "", enddate: "" });
    } else {
      setMsg(data.error);
      setSuccess(false);
    }
  };

  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Walk-In Renting</h1>
      <p className="text-sm text-gray-500 mb-6">
        Customer arrived without a booking. Processing as{" "}
        <span className="font-medium text-gray-700">{session.name}</span>
        {session.hotelname && <> · {session.hotelname}</>}
      </p>
      <div className="bg-white rounded-xl shadow p-6 max-w-lg space-y-4">
        {[
          { label: "Room ID", key: "roomid", type: "number" },
          { label: "Customer ID", key: "customerid", type: "number" },
          { label: "Start Date", key: "startdate", type: "date" },
          { label: "End Date", key: "enddate", type: "date" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input type={type} className="w-full border rounded p-2 text-sm"
              value={form[key as keyof typeof form]}
              onChange={e => set(key, e.target.value)} />
          </div>
        ))}
        {msg && <p className={`text-sm ${success ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
        <button onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
          Create Walk-In Renting
        </button>
      </div>
    </div>
  );
}
