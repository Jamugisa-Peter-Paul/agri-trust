import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CowForm } from "@/components/admin/CowForm";
import { QRCodeGenerator } from "@/components/admin/QRCodeGenerator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";

export default async function EditCowPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const cow = await prisma.cow.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!cow) {
    return <div className="p-10 text-center">Livestock not found</div>;
  }

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const publicUrl = `${protocol}://${host}/cow/${cow.id}`;

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="pl-0 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-green-900 tracking-tight mb-2">Edit Livestock Profile</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Animal ID: <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">{cow.uniqueId}</span></span>
                <span>Owner ID: <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{cow.ownerDigitalId}</span></span>
              </div>
            </div>
            
            <CowForm initialData={{
                species: cow.species,
                breed: cow.breed,
                dob: typeof cow.dob === "object" && cow.dob !== null ? (cow.dob as Date).toISOString().split("T")[0] : String(cow.dob),
                gender: cow.gender,
                ownerName: cow.ownerName,
                location: cow.location,
                animalImage: cow.animalImage,
                feedType: cow.feedType,
                collateralStatus: cow.collateralStatus,
                finalValue: Number(cow.finalValue),
                vaccinationRecords: cow.vaccinationRecords,
                weightHistory: cow.weightHistory,
                medicalTreatments: cow.medicalTreatments,
                reproductiveHistory: cow.reproductiveHistory,
                movementLogs: cow.movementLogs,
                slaughterExportData: cow.slaughterExportData,
            }} cowId={cow.id} />
        </div>

        <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 tracking-tight">QR Code</h3>
            <p className="text-sm text-slate-500">Download or print the QR code. Anyone who scans it will see this animal&apos;s full public profile.</p>
            <QRCodeGenerator url={publicUrl} title={`${cow.species} - ${cow.uniqueId}`} />
        </div>
      </div>
    </div>
  );
}
