import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Deprecated — history is now stored locally in the browser" },
    { status: 410 }
  );
}
