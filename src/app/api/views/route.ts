import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/views?view=rooms_per_area  |  ?view=hotel_capacity
export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view");

  const viewMap: Record<string, string> = {
    rooms_per_area: "SELECT * FROM available_rooms_per_area",
    hotel_capacity: "SELECT * FROM hotel_room_capacity",
  };

  if (!view || !viewMap[view]) {
    return NextResponse.json(
      { error: "view must be 'rooms_per_area' or 'hotel_capacity'" },
      { status: 400 }
    );
  }

  try {
    const result = await query(viewMap[view]);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
