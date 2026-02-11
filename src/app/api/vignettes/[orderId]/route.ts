import { NextRequest, NextResponse } from "next/server";
import { vignettesService } from "@/services/vignettes";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const result = await vignettesService.getOrderStatus(orderId);
  return NextResponse.json(result);
}
