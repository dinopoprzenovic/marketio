import { NextRequest, NextResponse } from "next/server";
import { vignettesService } from "@/services/vignettes";

export async function GET() {
  const result = await vignettesService.getCountries();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await vignettesService.purchase(body);
  return NextResponse.json(result);
}
