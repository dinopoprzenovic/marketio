import { NextRequest, NextResponse } from "next/server";
import { topupsService } from "@/services/topups";

export async function GET() {
  const result = await topupsService.getOperators();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await topupsService.purchase(body);
  return NextResponse.json(result);
}
