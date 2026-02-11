import { NextRequest, NextResponse } from "next/server";
import { vouchersService } from "@/services/vouchers";

export async function GET() {
  const result = await vouchersService.getBrands();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await vouchersService.purchase(body);
  return NextResponse.json(result);
}
