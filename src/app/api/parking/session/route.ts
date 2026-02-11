import { NextRequest, NextResponse } from "next/server";
import { parkingService } from "@/services/parking";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await parkingService.startSession(body);
  return NextResponse.json(result);
}
