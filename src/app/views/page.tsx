"use client";
import { useState, useEffect } from "react";

interface AreaRow { area: string; available_room_count: number; }
interface CapRow { hotelid: number; hotelname: string; chainname: string; starcount: number; room_count: number; total_capacity: number; }

export default function ViewsPage() {
  const [areaRows, setAreaRows] = useState<AreaRow[]>([]);
  const [capRows, setCapRows] = useState<CapRow[]>([]);

  useEffect(() => {
    fetch("/api/views?view=rooms_per_area").then(r => r.json()).then(data => setAreaRows(Array.isArray(data) ? data : []));
    fetch("/api/views?view=hotel_capacity").then(r => r.json()).then(data => setCapRows(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">SQL Views</h1>

      {/* View 1 */}
      <section>
        <h2 className="text-lg font-semibold mb-1">View 1 — Available Rooms per Area</h2>
        <p className="text-xs text-gray-500 mb-3 font-mono">
          SELECT area, COUNT(roomID) FROM Room JOIN Hotel … WHERE bookingStatus = 'Available' GROUP BY area
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse w-full max-w-md">
            <thead><tr className="bg-gray-100">
              <th className="p-2 border text-left">Area</th>
              <th className="p-2 border text-right">Available Rooms</th>
            </tr></thead>
            <tbody>
              {areaRows.map(r => (
                <tr key={r.area} className="border-b">
                  <td className="p-2 border">{r.area}</td>
                  <td className="p-2 border text-right font-medium">{r.available_room_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* View 2 */}
      <section>
        <h2 className="text-lg font-semibold mb-1">View 2 — Aggregated Room Capacity per Hotel</h2>
        <p className="text-xs text-gray-500 mb-3 font-mono">
          SELECT hotelName, SUM(capacity) AS total_capacity FROM Room JOIN Hotel … GROUP BY hotelID
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead><tr className="bg-gray-100 text-left">
              {["ID","Hotel","Chain","Stars","Rooms","Total Capacity"].map(h => (
                <th key={h} className="p-2 border">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {capRows.map(r => (
                <tr key={r.hotelid} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{r.hotelid}</td>
                  <td className="p-2 border font-medium">{r.hotelname}</td>
                  <td className="p-2 border">{r.chainname}</td>
                  <td className="p-2 border">{"★".repeat(r.starcount)}</td>
                  <td className="p-2 border text-center">{r.room_count}</td>
                  <td className="p-2 border text-center font-semibold">{r.total_capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
