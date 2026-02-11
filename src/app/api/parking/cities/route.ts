import { NextResponse } from "next/server";
import { parkingService } from "@/services/parking";

export async function GET() {
  const result = await parkingService.getCities();
  return NextResponse.json(result);
}
