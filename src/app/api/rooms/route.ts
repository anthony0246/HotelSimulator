import { NextRequest, NextResponse } from "next/server";
import { query, pool } from "@/lib/db";

// GET /api/rooms — availability search with optional filters
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const startDate = sp.get("startDate");
  const endDate = sp.get("endDate");
  const capacity = sp.get("capacity");
  const area = sp.get("area");
  const chainId = sp.get("chainId");
  const starCount = sp.get("starCount");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const hotelId = sp.get("hotelId");

  const params: unknown[] = [];
  let idx = 1;

  let sql = `
    SELECT
      r.roomid, r.price, r.capacity, r.viewtype, r.extendability, r.bookingstatus,
      h.hotelid, h.hotelname, h.address, h.starcount, h.email AS hotelemail,
      hc.chainid, hc.chainname,
      COALESCE(
        (SELECT json_agg(ra.amenityname) FROM Room_amenity ra WHERE ra.roomid = r.roomid),
        '[]'
      ) AS amenities
    FROM Room r
    JOIN Hotel h       ON h.hotelid  = r.hotelid
    JOIN HotelChain hc ON hc.chainid = h.chainid
    WHERE 1=1
  `;

  if (startDate && endDate) {
    sql += ` AND r.bookingstatus = 'Available'`;
    sql += ` AND NOT EXISTS (
      SELECT 1 FROM Booking b
      WHERE b.roomid    = r.roomid
        AND b.startdate < $${idx}
        AND b.enddate   > $${idx + 1}
    )`;
    params.push(endDate, startDate);
    idx += 2;

    sql += ` AND NOT EXISTS (
      SELECT 1 FROM Renting rt
      WHERE rt.roomid    = r.roomid
        AND rt.startdate < $${idx}
        AND rt.enddate   > $${idx + 1}
    )`;
    params.push(endDate, startDate);
    idx += 2;
  }

  if (capacity) {
    sql += ` AND r.capacity >= $${idx++}`;
    params.push(Number(capacity));
  }
  if (minPrice) {
    sql += ` AND r.price >= $${idx++}`;
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    sql += ` AND r.price <= $${idx++}`;
    params.push(Number(maxPrice));
  }
  if (starCount) {
    sql += ` AND h.starcount = $${idx++}`;
    params.push(Number(starCount));
  }
  if (chainId) {
    sql += ` AND hc.chainid = $${idx++}`;
    params.push(Number(chainId));
  }
  if (hotelId) {
    sql += ` AND h.hotelid = $${idx++}`;
    params.push(Number(hotelId));
  }
  if (area) {
    sql += ` AND LOWER(h.address) LIKE LOWER($${idx++})`;
    params.push(`%${area}%`);
  }

  sql += ` ORDER BY r.price ASC LIMIT 200`;

  try {
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/rooms — create a new room (employee CRUD)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotelid, price, capacity, viewtype, extendability } = body;

  if (!hotelid || !price || !capacity) {
    return NextResponse.json({ error: "hotelid, price, capacity required" }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO Room (hotelid, price, capacity, viewtype, extendability)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [hotelid, price, capacity, viewtype ?? null, extendability ?? false]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PUT /api/rooms — update a room
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { roomid, price, capacity, viewtype, extendability, bookingstatus } = body;

  if (!roomid) {
    return NextResponse.json({ error: "roomid required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE Room
       SET price=$2, capacity=$3, viewtype=$4, extendability=$5, bookingstatus=$6
       WHERE roomid=$1 RETURNING *`,
      [roomid, price, capacity, viewtype, extendability, bookingstatus]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/rooms?roomId=X
export async function DELETE(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get("roomId");
  if (!roomId) {
    return NextResponse.json({ error: "roomId required" }, { status: 400 });
  }

  try {
    await query("DELETE FROM Room WHERE roomid = $1", [Number(roomId)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
