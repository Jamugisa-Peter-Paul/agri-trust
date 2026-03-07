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

    // Extract dynamic arrays from incoming data
    const { 
      vaccinationRecords, 
      weightHistory, 
      medicalTreatments, 
      reproductiveHistory, 
      movementLogs,
      slaughterExportData,
      collateralStatus,
      finalValue,
      ...basicData 
    } = data;

    // Fetch existing records to enforce immutability strictly on the server side too.
    const existing = await prisma.rabbit.findUnique({ where: { id: resolvedParams.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Helper: merge existing immutable rows with incoming rows
    const mergeArrays = (oldData: any, newData: any) => {
       const oldArr = Array.isArray(oldData) ? oldData : (typeof oldData === 'object' && Object.keys(oldData).length ? [oldData] : []);
       const newArr = Array.isArray(newData) ? newData : [];
       return [...oldArr, ...newArr]; // Append-only
    };

    const updatedData: any = {};
    
    // Arrays only accept appends
    updatedData.vaccinationRecords = mergeArrays(existing.vaccinationRecords, vaccinationRecords);
    updatedData.weightHistory = mergeArrays(existing.weightHistory, weightHistory);
    updatedData.medicalTreatments = mergeArrays(existing.medicalTreatments, medicalTreatments);
    updatedData.reproductiveHistory = mergeArrays(existing.reproductiveHistory, reproductiveHistory);
    updatedData.movementLogs = mergeArrays(existing.movementLogs, movementLogs);

    // Financial logic
    if (existing.collateralStatus) {
        // if it was true, it stays true
        updatedData.collateralStatus = true;
    } else {
        updatedData.collateralStatus = collateralStatus;
    }

    if (Number(existing.finalValue) > 0) {
        // if it was set, it stays
        updatedData.finalValue = existing.finalValue;
    } else {
        updatedData.finalValue = finalValue;
    }

    // Slaughter Export logic
    const existingSlaughter = typeof existing.slaughterExportData === 'object' ? existing.slaughterExportData : {};
    if ((existingSlaughter as any)?.destination || (existingSlaughter as any)?.date) {
        // locked
        updatedData.slaughterExportData = existing.slaughterExportData;
    } else {
        updatedData.slaughterExportData = slaughterExportData;
    }

    const rabbit = await prisma.rabbit.update({
      where: { id: resolvedParams.id },
      data: updatedData,
    });

    return NextResponse.json(rabbit);
  } catch (error) {
    console.error("PATCH /api/rabbits/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
    const resolvedParams = await params;
    const rabbit = await prisma.rabbit.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!rabbit) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rabbit);
  } catch (error) {
    console.error("GET /api/rabbits/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
