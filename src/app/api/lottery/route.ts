import { NextRequest, NextResponse } from "next/server";
import { lotteryService } from "@/services/lottery";

export async function GET() {
  const result = await lotteryService.getProducts();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await lotteryService.purchase(body);
  return NextResponse.json(result);
}
