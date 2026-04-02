import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  let sql = `
    SELECT
      e.*,
      COALESCE(
        (SELECT json_agg(er.role) FROM Employee_role er WHERE er.employeeid = e.employeeid),
        '[]'
      ) AS roles,
      h.hotelname
    FROM Employee e
    LEFT JOIN Hotel h ON h.hotelid = e.hotelid
  `;
  const params: unknown[] = [];

  if (employeeId) {
    sql += ` WHERE e.employeeid = $1`;
    params.push(Number(employeeId));
  } else if (hotelId) {
    sql += ` WHERE e.hotelid = $1`;
    params.push(Number(hotelId));
  }
  sql += ` ORDER BY e.lastname, e.firstname LIMIT 200`;

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
  const { firstname, lastname, address, ssn, hotelid, roles } = body;

  if (!firstname || !lastname || !address || !ssn || !hotelid) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO Employee (firstname, lastname, address, ssn, hotelid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstname, lastname, address, ssn, hotelid]
    );
    const emp = result.rows[0];

    // Assign roles if provided
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        await query(
          "INSERT INTO Employee_role (employeeid, role) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [emp.employeeid, role]
        );
      }
    }
    return NextResponse.json(emp, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) {
      return NextResponse.json({ error: "SSN already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { employeeid, firstname, lastname, address, ssn, hotelid } = body;

  if (!employeeid) {
    return NextResponse.json({ error: "employeeid required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE Employee
       SET firstname=$2, lastname=$3, address=$4, ssn=$5, hotelid=$6
       WHERE employeeid=$1 RETURNING *`,
      [employeeid, firstname, lastname, address, ssn, hotelid]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get("employeeId");
  if (!employeeId) {
    return NextResponse.json({ error: "employeeId required" }, { status: 400 });
  }

  try {
    await query("DELETE FROM Employee WHERE employeeid = $1", [Number(employeeId)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
