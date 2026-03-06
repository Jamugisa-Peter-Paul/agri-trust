import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const data = await req.json();
    
    if (data.dob) {
      data.dob = new Date(data.dob);
    }

    const cow = await prisma.cow.update({
      where: { id: resolvedParams.id },
      data,
    });

    return NextResponse.json(cow);
  } catch (error) {
    console.error("PATCH /api/cows/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
    const resolvedParams = await params;
    // Note: This API endpoint is public for read-only QR code scanning
    const cow = await prisma.cow.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!cow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(cow);
  } catch (error) {
    console.error("GET /api/cows/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
