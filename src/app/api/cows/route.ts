import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function generateUniqueId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "AT-";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function generateOwnerId(name: string): string {
  const initials = name
    .split(" ")
    .map(n => n[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 3);
  const num = crypto.randomBytes(3).toString("hex").toUpperCase().substring(0, 4);
  return `OWN-${initials}-${num}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cows = await prisma.cow.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(cows);
  } catch (error) {
    console.error("GET /api/cows error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    const cow = await prisma.cow.create({
      data: {
        uniqueId: generateUniqueId(),
        species: data.species,
        breed: data.breed,
        dob: new Date(data.dob),
        gender: data.gender,
        ownerName: data.ownerName,
        ownerDigitalId: generateOwnerId(data.ownerName || "UNKNOWN"),
        location: data.location,
        animalImage: data.animalImage || "",
        feedType: data.feedType,
        vaccinationRecords: data.vaccinationRecords || {},
        weightHistory: data.weightHistory || {},
        medicalTreatments: data.medicalTreatments || {},
        reproductiveHistory: data.reproductiveHistory || {},
        movementLogs: data.movementLogs || {},
        collateralStatus: data.collateralStatus || false,
        finalValue: data.finalValue || 0,
        slaughterExportData: data.slaughterExportData || {},
      }
    });

    return NextResponse.json(cow, { status: 201 });
  } catch (error) {
    console.error("POST /api/cows error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
