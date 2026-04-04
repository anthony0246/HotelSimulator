import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const customerId = req.nextUrl.searchParams.get("customerId");

  let sql = `SELECT * FROM Customer`;
  const params: unknown[] = [];

  const email = req.nextUrl.searchParams.get("email");

  if (customerId) {
    sql += ` WHERE customerid = $1`;
    params.push(Number(customerId));
  } else if (email) {
    sql += ` WHERE LOWER(email) = LOWER($1)`;
    params.push(email.trim());
  } else if (search) {
    sql += ` WHERE LOWER(firstname) LIKE LOWER($1) OR LOWER(lastname) LIKE LOWER($1) OR idnumber = $1`;
    params.push(`%${search}%`);
  }
  sql += ` ORDER BY lastname, firstname LIMIT 100`;

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
  const { firstname, lastname, address, idtype, idnumber } = body;

  if (!firstname || !lastname || !address || !idtype || !idnumber) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO Customer (firstname, lastname, address, idtype, idnumber)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstname, lastname, address, idtype, idnumber]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) {
      return NextResponse.json({ error: "ID number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { customerid, firstname, lastname, address, idtype, idnumber } = body;

  if (!customerid) {
    return NextResponse.json({ error: "customerid required" }, { status: 400 });
  }

  try {
    const result = await query(
      `UPDATE Customer
       SET firstname=$2, lastname=$3, address=$4, idtype=$5, idnumber=$6
       WHERE customerid=$1 RETURNING *`,
      [customerid, firstname, lastname, address, idtype, idnumber]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  try {
    await query("DELETE FROM Customer WHERE customerid = $1", [Number(customerId)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
