import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/bookings?customerId=X   — or no param = all bookings (employee view)
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");

  let sql = `
    SELECT
      b.bookingid, b.startdate, b.enddate,
      b.roomid, r.price, r.capacity, r.viewtype,
      h.hotelname, h.address, hc.chainname,
      b.customerid, c.firstname AS customerfirstname, c.lastname AS customerlastname,
      (ci.rentingid IS NOT NULL) AS checkedin
    FROM Booking b
    JOIN Room r        ON r.roomid     = b.roomid
    JOIN Hotel h       ON h.hotelid    = r.hotelid
    JOIN HotelChain hc ON hc.chainid   = h.chainid
    JOIN Customer c    ON c.customerid = b.customerid
    LEFT JOIN Check_in ci ON ci.bookingid = b.bookingid
  `;
  const params: unknown[] = [];

  if (customerId) {
    sql += ` WHERE b.customerid = $1`;
    params.push(Number(customerId));
  }
  sql += ` ORDER BY b.startdate`;

  try {
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/bookings — create a new booking
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomid, customerid, startdate, enddate } = body;

  if (!roomid || !customerid || !startdate || !enddate) {
    return NextResponse.json(
      { error: "roomid, customerid, startdate, enddate required" },
      { status: 400 }
    );
  }

  // Validate date logic
  if (new Date(enddate) <= new Date(startdate)) {
    return NextResponse.json(
      { error: "enddate must be after startdate" },
      { status: 400 }
    );
  }

  // Check for date overlap before insert (gives a clearer error than the DB constraint)
  const overlap = await query(
    `SELECT 1 FROM Booking
     WHERE roomid = $1 AND startdate < $2 AND enddate > $3
     UNION ALL
     SELECT 1 FROM Renting
     WHERE roomid = $1 AND startdate < $2 AND enddate > $3
     LIMIT 1`,
    [roomid, enddate, startdate]
  );

  if (overlap.rowCount && overlap.rowCount > 0) {
    return NextResponse.json(
      { error: "Room is not available for the selected dates" },
      { status: 409 }
    );
  }

  try {
    const result = await query(
      `INSERT INTO Booking (startdate, enddate, roomid, customerid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [startdate, enddate, roomid, customerid]
    );
    // Trigger trg_room_set_booked fires automatically in the DB
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/bookings?bookingId=X — cancel a booking
export async function DELETE(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  try {
    // Triggers: trg_archive_booking (BEFORE DELETE) then trg_room_restore_status (AFTER DELETE)
    // both fire automatically.
    const result = await query(
      "DELETE FROM Booking WHERE bookingid = $1 RETURNING bookingid",
      [Number(bookingId)]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
