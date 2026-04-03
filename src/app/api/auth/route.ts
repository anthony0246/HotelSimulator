import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/auth  — { email, password, role: 'customer'|'employee' }
export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, role required" }, { status: 400 });
  }

  try {
    if (role === "customer") {
      const result = await query(
        `SELECT customerid AS id, firstname, lastname, email
         FROM Customer WHERE email = $1 AND password = $2`,
        [email, password]
      );
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const u = result.rows[0];
      return NextResponse.json({
        id: u.id,
        name: `${u.firstname} ${u.lastname}`,
        email: u.email,
        role: "customer",
      });
    }

    if (role === "employee") {
      const result = await query(
        `SELECT e.employeeid AS id, e.firstname, e.lastname, e.email, e.hotelid,
                h.hotelname,
                COALESCE(
                  (SELECT json_agg(er.role) FROM Employee_role er WHERE er.employeeid = e.employeeid),
                  '[]'
                ) AS roles
         FROM Employee e
         LEFT JOIN Hotel h ON h.hotelid = e.hotelid
         WHERE e.email = $1 AND e.password = $2`,
        [email, password]
      );
      if (result.rowCount === 0) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const u = result.rows[0];
      return NextResponse.json({
        id: u.id,
        name: `${u.firstname} ${u.lastname}`,
        email: u.email,
        role: "employee",
        hotelid: u.hotelid,
        hotelname: u.hotelname,
        roles: u.roles,
      });
    }

    return NextResponse.json({ error: "role must be customer or employee" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE /api/auth — logout (client clears localStorage, but endpoint exists for completeness)
export async function DELETE() {
  return NextResponse.json({ success: true });
}
