import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const chainId = req.nextUrl.searchParams.get("chainId");
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  const chainsOnly = req.nextUrl.searchParams.get("chains");

  // Return all chains (for dropdown)
  if (chainsOnly === "true") {
    try {
      const result = await query("SELECT * FROM HotelChain ORDER BY chainname");
      return NextResponse.json(result.rows);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  let sql = `
    SELECT
      h.*,
      hc.chainname,
      e.firstname AS managerfirstname,
      e.lastname  AS managerlastname,
      (SELECT COUNT(*) FROM Room r WHERE r.hotelid = h.hotelid) AS actual_room_count
    FROM Hotel h
    JOIN HotelChain hc ON hc.chainid   = h.chainid
    JOIN Employee e    ON e.employeeid  = h.managerid
  `;
  const params: unknown[] = [];

  if (hotelId) {
    sql += ` WHERE h.hotelid = $1`;
    params.push(Number(hotelId));
  } else if (chainId) {
    sql += ` WHERE h.chainid = $1`;
    params.push(Number(chainId));
  }
  sql += ` ORDER BY hc.chainname, h.hotelname LIMIT 200`;

  try {
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hotelname, address, starcount, email, chainid, managerid } = body;

  if (!hotelname || !address || !starcount || !chainid || !managerid) {
    return NextResponse.json({ error: "hotelname, address, starcount, chainid, managerid required" }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO Hotel (hotelname, address, starcount, email, chainid, managerid)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [hotelname, address, starcount, email ?? null, chainid, managerid]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { hotelid, hotelname, address, starcount, email, chainid, managerid } = body;

  if (!hotelid) {
    return NextResponse.json({ error: "hotelid required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE Hotel
       SET hotelname=$2, address=$3, starcount=$4, email=$5, chainid=$6, managerid=$7
       WHERE hotelid=$1 RETURNING *`,
      [hotelid, hotelname, address, starcount, email, chainid, managerid]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json({ error: "hotelId required" }, { status: 400 });
  }

  try {
    await query("DELETE FROM Hotel WHERE hotelid = $1", [Number(hotelId)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
