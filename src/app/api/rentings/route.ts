import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";

// GET /api/rentings?customerId=X or ?employeeId=X or no param = all
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  let sql = `
    SELECT
      rt.rentingid, rt.startdate, rt.enddate, rt.paid,
      rt.roomid, r.price, r.capacity, r.viewtype,
      h.hotelname, h.address, hc.chainname,
      rt.customerid, c.firstname AS customerfirstname, c.lastname AS customerlastname,
      rt.employeeid, e.firstname AS empfirstname, e.lastname AS emplastname,
      ci.bookingid AS sourcedbookingid
    FROM Renting rt
    JOIN Room r        ON r.roomid      = rt.roomid
    JOIN Hotel h       ON h.hotelid     = r.hotelid
    JOIN HotelChain hc ON hc.chainid    = h.chainid
    JOIN Customer c    ON c.customerid  = rt.customerid
    JOIN Employee e    ON e.employeeid  = rt.employeeid
    LEFT JOIN Check_in ci ON ci.rentingid = rt.rentingid
  `;
  const params: unknown[] = [];

  if (customerId) {
    sql += ` WHERE rt.customerid = $1`;
    params.push(Number(customerId));
  } else if (employeeId) {
    sql += ` WHERE rt.employeeid = $1`;
    params.push(Number(employeeId));
  }
  sql += ` ORDER BY rt.startdate DESC`;

  try {
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/rentings — create a renting (walk-in OR booking→renting check-in)
// Body: { roomid, customerid, employeeid, startdate, enddate, bookingid? }
// If bookingid is provided: also insert into Check_in (booking → renting flow)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomid, customerid, employeeid, startdate, enddate, bookingid } = body;

  if (!roomid || !customerid || !employeeid || !startdate || !enddate) {
    return NextResponse.json(
      { error: "roomid, customerid, employeeid, startdate, enddate required" },
      { status: 400 }
    );
  }

  if (new Date(enddate) <= new Date(startdate)) {
    return NextResponse.json(
      { error: "enddate must be after startdate" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert the renting
    const rentingResult = await client.query(
      `INSERT INTO Renting (startdate, enddate, roomid, customerid, employeeid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [startdate, enddate, roomid, customerid, employeeid]
    );
    const renting = rentingResult.rows[0];

    // If converting a booking: link them in Check_in and remove the booking's
    // 'Booked' status (trigger sets it to 'Rented' via trg_room_set_rented).
    if (bookingid) {
      // Verify booking exists and is not already checked in
      const existing = await client.query(
        "SELECT 1 FROM Check_in WHERE bookingid = $1",
        [bookingid]
      );
      if (existing.rowCount && existing.rowCount > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Booking has already been checked in" },
          { status: 409 }
        );
      }

      // Verify booking's hotel chain matches the employee's hotel chain
      const chainCheck = await client.query(
        `SELECT 1
         FROM Booking b
         JOIN Room r   ON r.roomid  = b.roomid
         JOIN Hotel bh ON bh.hotelid = r.hotelid
         JOIN Hotel eh ON eh.hotelid = (SELECT hotelid FROM Employee WHERE employeeid = $2)
         WHERE b.bookingid = $1 AND bh.chainid = eh.chainid`,
        [bookingid, employeeid]
      );
      if (!chainCheck.rowCount || chainCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "You can only check in guests whose booking is for a hotel in your chain" },
          { status: 403 }
        );
      }

      await client.query(
        "INSERT INTO Check_in (bookingid, rentingid) VALUES ($1, $2)",
        [bookingid, renting.rentingid]
      );
    }

    // Trigger trg_room_set_rented fires automatically on Renting INSERT
    await client.query("COMMIT");
    return NextResponse.json(renting, { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  } finally {
    client.release();
  }
}

// PUT /api/rentings — mark renting as paid
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { rentingid, paid } = body;

  if (rentingid === undefined) {
    return NextResponse.json({ error: "rentingid required" }, { status: 400 });
  }

  try {
    const result = await query(
      "UPDATE Renting SET paid = $2 WHERE rentingid = $1 RETURNING *",
      [rentingid, paid ?? true]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Renting not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/rentings?rentingId=X
export async function DELETE(req: NextRequest) {
  const rentingId = req.nextUrl.searchParams.get("rentingId");
  if (!rentingId) {
    return NextResponse.json({ error: "rentingId required" }, { status: 400 });
  }

  try {
    // Trigger trg_archive_renting fires automatically
    const result = await query(
      "DELETE FROM Renting WHERE rentingid = $1 RETURNING rentingid",
      [Number(rentingId)]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Renting not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
