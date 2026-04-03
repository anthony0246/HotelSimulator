"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Tab = "rooms" | "customers" | "hotels" | "employees" | "rentings";

// ---- Rentings sub-panel ----
function RentingsPanel() {
  const [rentings, setRentings] = useState<Record<string, unknown>[]>([]);
  const load = useCallback(async () => {
    const res = await fetch("/api/rentings");
    const data = await res.json();
    setRentings(Array.isArray(data) ? data : []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const markPaid = async (id: number) => {
    await fetch("/api/rentings", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rentingid: id, paid: true }) });
    load();
  };
  const del = async (id: number) => {
    if (!confirm("Delete and archive this renting?")) return;
    await fetch(`/api/rentings?rentingId=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead><tr className="bg-gray-100 text-left">
          {["ID","Customer","Room","Hotel","Dates","Paid","Actions"].map(h => (
            <th key={h} className="p-2 border">{h}</th>))}
        </tr></thead>
        <tbody>{rentings.map((r: Record<string, unknown>) => (
          <tr key={String(r.rentingid)} className="border-b hover:bg-gray-50">
            <td className="p-2 border">{String(r.rentingid)}</td>
            <td className="p-2 border">{String(r.customerfirstname)} {String(r.customerlastname)}</td>
            <td className="p-2 border">#{String(r.roomid)}</td>
            <td className="p-2 border">{String(r.hotelname)}</td>
            <td className="p-2 border">{String(r.startdate).slice(0,10)} → {String(r.enddate).slice(0,10)}</td>
            <td className="p-2 border">{r.paid ? "✅" : "❌"}</td>
            <td className="p-2 border flex gap-1">
              {!r.paid && <button onClick={() => markPaid(Number(r.rentingid))} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200">Mark Paid</button>}
              <button onClick={() => del(Number(r.rentingid))} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200">Delete</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ---- Generic CRUD panel ----
function CrudPanel({ endpoint, columns, createFields }: {
  endpoint: string;
  columns: { key: string; label: string }[];
  createFields: { key: string; label: string; type?: string }[];
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/${endpoint}`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  }, [endpoint]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    const res = await fetch(`/api/${endpoint}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.fromEntries(Object.entries(form).map(([k,v]) => [k, isNaN(Number(v)) || v === "" ? v : Number(v)]))
      ),
    });
    const data = await res.json();
    setMsg(res.ok ? "Created!" : data.error);
    if (res.ok) { setForm({}); load(); }
  };

  const del = async (id: unknown) => {
    const idKey = columns[0].key;
    if (!confirm(`Delete ${idKey}=${id}?`)) return;
    const paramKey = idKey.replace("id","Id").replace("Id","Id");
    await fetch(`/api/${endpoint}?${paramKey}=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="bg-gray-50 border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3">Add New</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {createFields.map(f => (
            <div key={f.key}>
              <label className="block text-xs mb-0.5">{f.label}</label>
              <input type={f.type ?? "text"} className="w-full border rounded p-1.5 text-sm"
                value={form[f.key] ?? ""}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        {msg && <p className={`text-xs mt-2 ${msg === "Created!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
        <button onClick={create} className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">Add</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-gray-100 text-left">
            {[...columns, { key: "_del", label: "" }].map(c => (
              <th key={c.key} className="p-2 border">{c.label}</th>
            ))}
          </tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              {columns.map(c => <td key={c.key} className="p-2 border">{String(r[c.key] ?? "")}</td>)}
              <td className="p-2 border">
                <button onClick={() => del(r[columns[0].key])}
                  className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200">Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManagePage() {
  const { session } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("rooms");

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    if (session.role !== "employee") { router.push("/customer/search"); return; }
  }, [session, router]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "rentings",  label: "Rentings" },
    { id: "rooms",     label: "Rooms" },
    { id: "customers", label: "Customers" },
    { id: "hotels",    label: "Hotels" },
    { id: "employees", label: "Employees" },
  ];

  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Data</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rentings" && <RentingsPanel />}

      {tab === "rooms" && (
        <CrudPanel
          endpoint="rooms"
          columns={[
            { key: "roomid", label: "ID" }, { key: "hotelid", label: "Hotel ID" },
            { key: "price", label: "Price" }, { key: "capacity", label: "Cap." },
            { key: "viewtype", label: "View" }, { key: "bookingstatus", label: "Status" },
          ]}
          createFields={[
            { key: "hotelid", label: "Hotel ID", type: "number" },
            { key: "price", label: "Price", type: "number" },
            { key: "capacity", label: "Capacity", type: "number" },
            { key: "viewtype", label: "View (Sea/Mountain)" },
            { key: "extendability", label: "Extendable (true/false)" },
          ]}
        />
      )}

      {tab === "customers" && (
        <CrudPanel
          endpoint="customers"
          columns={[
            { key: "customerid", label: "ID" }, { key: "firstname", label: "First" },
            { key: "lastname", label: "Last" }, { key: "address", label: "Address" },
            { key: "idtype", label: "ID Type" }, { key: "idnumber", label: "ID #" },
            { key: "registrationdate", label: "Registered" },
          ]}
          createFields={[
            { key: "firstname", label: "First Name" }, { key: "lastname", label: "Last Name" },
            { key: "address", label: "Address" }, { key: "idtype", label: "ID Type (SSN/SIN/Driving Licence)" },
            { key: "idnumber", label: "ID Number" },
          ]}
        />
      )}

      {tab === "hotels" && (
        <CrudPanel
          endpoint="hotels"
          columns={[
            { key: "hotelid", label: "ID" }, { key: "hotelname", label: "Name" },
            { key: "address", label: "Address" }, { key: "starcount", label: "Stars" },
            { key: "chainname", label: "Chain" }, { key: "roomcount", label: "Rooms" },
          ]}
          createFields={[
            { key: "hotelname", label: "Hotel Name" }, { key: "address", label: "Address (Street, City, Province)" },
            { key: "starcount", label: "Stars (1-5)", type: "number" },
            { key: "email", label: "Email" },
            { key: "chainid", label: "Chain ID", type: "number" },
            { key: "managerid", label: "Manager Employee ID", type: "number" },
          ]}
        />
      )}

      {tab === "employees" && (
        <CrudPanel
          endpoint="employees"
          columns={[
            { key: "employeeid", label: "ID" }, { key: "firstname", label: "First" },
            { key: "lastname", label: "Last" }, { key: "address", label: "Address" },
            { key: "ssn", label: "SSN" }, { key: "hotelname", label: "Hotel" },
          ]}
          createFields={[
            { key: "firstname", label: "First Name" }, { key: "lastname", label: "Last Name" },
            { key: "address", label: "Address" }, { key: "ssn", label: "SSN" },
            { key: "hotelid", label: "Hotel ID", type: "number" },
            { key: "roles", label: "Role (Manager/Receptionist/Housekeeper/Maintenance/Concierge)" },
          ]}
        />
      )}
    </div>
  );
}
