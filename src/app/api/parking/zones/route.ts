import { NextRequest, NextResponse } from "next/server";
import { parkingService } from "@/services/parking";

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get("cityId");
  if (!cityId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_PARAM", message: "cityId is required" } },
      { status: 400 }
    );
  }
  const result = await parkingService.getZones(cityId);
  return NextResponse.json(result);
}
