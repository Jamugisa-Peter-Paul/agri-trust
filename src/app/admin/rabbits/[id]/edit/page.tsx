import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RabbitForm } from "@/components/admin/RabbitForm";
import { QRCodeGenerator } from "@/components/admin/QRCodeGenerator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";

export default async function EditRabbitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const rabbit = await prisma.rabbit.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!rabbit) {
    return <div className="p-10 text-center">Rabbit not found</div>;
  }

  // Use Vercel's production URL if deployed, otherwise fall back to dynamic host
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const vercelUrl = process.env.VERCEL_URL;
  
  let publicUrl: string;
  if (vercelProd) {
    publicUrl = `https://${vercelProd}/rabbit/${rabbit.id}`;
  } else if (vercelUrl) {
    publicUrl = `https://${vercelUrl}/rabbit/${rabbit.id}`;
  } else {
    // Local development fallback (uses network IP or localhost dynamically)
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    publicUrl = `${protocol}://${host}/rabbit/${rabbit.id}`;
  }

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
              <h1 className="text-3xl font-bold text-green-900 tracking-tight mb-2">Rabbit File</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Rabbit ID: <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">{rabbit.uniqueId}</span></span>
                <span>Owner ID: <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{rabbit.ownerDigitalId}</span></span>
              </div>
            </div>
            
            <RabbitForm initialData={{
                species: rabbit.species,
                breed: rabbit.breed,
                dob: typeof rabbit.dob === "object" && rabbit.dob !== null ? (rabbit.dob as Date).toISOString().split("T")[0] : String(rabbit.dob),
                gender: rabbit.gender,
                ownerName: rabbit.ownerName,
                location: rabbit.location,
                animalImage: rabbit.animalImage,
                feedType: rabbit.feedType,
                collateralStatus: rabbit.collateralStatus,
                finalValue: Number(rabbit.finalValue),
                vaccinationRecords: rabbit.vaccinationRecords,
                weightHistory: rabbit.weightHistory,
                medicalTreatments: rabbit.medicalTreatments,
                reproductiveHistory: rabbit.reproductiveHistory,
                movementLogs: rabbit.movementLogs,
                slaughterExportData: rabbit.slaughterExportData,
            }} rabbitId={rabbit.id} />
        </div>

        <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 tracking-tight">QR Code</h3>
            <p className="text-sm text-slate-500">Download or print the QR code. Anyone who scans it will see this rabbit&apos;s full public profile.</p>
            <QRCodeGenerator url={publicUrl} title={`${rabbit.breed} - ${rabbit.uniqueId}`} />
        </div>
      </div>
    </div>
  );
}
