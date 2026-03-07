import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Syringe,
  Scale,
  Stethoscope,
  Wheat,
  Activity,
  History,
  FileAxis3d,
  Calendar,
  Info,
  User,
  DollarSign,
  Truck,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PublicRabbitProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rabbit = await prisma.rabbit.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!rabbit) {
    notFound();
  }

  const isEmptyData = (data: any): boolean => {
    if (!data) return true;
    if (typeof data === "object" && Object.keys(data).length === 0) return true;
    if (Array.isArray(data) && data.length === 0) return true;
    return false;
  };

  const formatEntries = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && Object.keys(data).length > 0) return [data];
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-green-800 to-green-600 relative">
             {rabbit.animalImage ? (
               <div className="absolute -bottom-10 left-8 bg-white p-1 rounded-xl shadow-md">
                 <img src={rabbit.animalImage} alt={`${rabbit.breed} ${rabbit.species}`} className="w-20 h-20 rounded-lg object-cover" />
               </div>
             ) : (
               <div className="absolute -bottom-10 left-8 bg-white p-2 rounded-xl shadow-md">
                 <div className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold text-3xl border border-green-100 pb-1">
                     🐇
                 </div>
               </div>
             )}
             <div className="absolute top-4 right-6">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">
                  Agri-Trust Verified
                </Badge>
             </div>
          </div>
          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {rabbit.breed} <span className="text-lg font-normal text-slate-500 ml-2">{rabbit.species}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 font-mono">
                  ID: {rabbit.uniqueId}
                </Badge>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {rabbit.ownerName}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {rabbit.location}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
                <div className="flex flex-col items-end gap-2">
                    <Badge className={`px-3 py-1 text-sm ${rabbit.collateralStatus ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`} variant="secondary">
                       {rabbit.collateralStatus ? "Asset Collateral" : "Active Asset"}
                    </Badge>
                    {Number(rabbit.finalValue) > 0 && (
                      <div className="text-lg font-semibold text-slate-700 mt-1">
                          Valuation: <span className="text-green-700">${Number(rabbit.finalValue).toLocaleString()}</span>
                      </div>
                    )}
                </div>
                <Link href={`/admin/rabbits/${rabbit.id}/edit`}>
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 shadow-sm mt-2">
                    <Edit className="w-4 h-4 mr-2" /> Add / Edit Records
                  </Button>
                </Link>
            </div>
          </div>
        </div>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600"><Calendar className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Date of Birth</p>
                        <p className="text-base font-semibold text-slate-900">{new Date(rabbit.dob).toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-rose-50 p-3 rounded-lg text-rose-600"><Info className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Gender</p>
                        <p className="text-base font-semibold text-slate-900">{rabbit.gender}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600"><MapPin className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Location</p>
                        <p className="text-base font-semibold text-slate-900">{rabbit.location}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600"><Wheat className="w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Feed Type</p>
                        <p className="text-base font-semibold text-slate-900">{rabbit.feedType}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Animal Image */}
        {rabbit.animalImage && (
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg text-slate-800">
                <ImageIcon className="w-5 h-5 mr-2 text-green-600" /> Rabbit Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <img src={rabbit.animalImage} alt={`${rabbit.breed} ${rabbit.species}`} className="w-full max-h-96 object-cover rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Health & Medical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg text-slate-800">
                   <Syringe className="w-5 h-5 mr-2 text-green-600" /> Vaccinations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {isEmptyData(rabbit.vaccinationRecords) ? (
                  <p className="text-sm text-slate-400 italic">No records yet</p>
                ) : (
                  <div className="space-y-2">
                    {formatEntries(rabbit.vaccinationRecords).map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-100 text-sm">
                        <span className="font-medium text-green-800">{v.vaccine}</span>
                        {v.date && <span className="text-slate-500">{v.date}</span>}
                        {v.vet && <span className="text-slate-500">by {v.vet}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg text-slate-800">
                   <Scale className="w-5 h-5 mr-2 text-blue-600" /> Weight History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {isEmptyData(rabbit.weightHistory) ? (
                  <p className="text-sm text-slate-400 italic">No records yet</p>
                ) : (
                  <div className="space-y-2">
                    {formatEntries(rabbit.weightHistory).map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100 text-sm">
                        <span className="text-slate-500">{w.date}</span>
                        <span className="font-semibold text-blue-800">{w.kg} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg text-slate-800">
                   <Stethoscope className="w-5 h-5 mr-2 text-red-600" /> Medical Treatments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {isEmptyData(rabbit.medicalTreatments) ? (
                  <p className="text-sm text-slate-400 italic">No records yet</p>
                ) : (
                  <div className="space-y-2">
                    {formatEntries(rabbit.medicalTreatments).map((t: any, i: number) => (
                      <div key={i} className="p-2 bg-red-50 rounded border border-red-100 text-sm">
                        <span className="font-medium text-red-800">{t.treatment}</span>
                        {t.date && <span className="text-slate-500 ml-2">{t.date}</span>}
                        {t.notes && <p className="text-slate-500 text-xs mt-1">{t.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg text-slate-800">
                   <History className="w-5 h-5 mr-2 text-purple-600" /> Reproductive History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {isEmptyData(rabbit.reproductiveHistory) ? (
                  <p className="text-sm text-slate-400 italic">No records yet</p>
                ) : (
                  <div className="space-y-2">
                    {formatEntries(rabbit.reproductiveHistory).map((r: any, i: number) => (
                      <div key={i} className="p-2 bg-purple-50 rounded border border-purple-100 text-sm">
                        <span className="font-medium text-purple-800">{r.event}</span>
                        {r.date && <span className="text-slate-500 ml-2">{r.date}</span>}
                        {r.notes && <p className="text-slate-500 text-xs mt-1">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Movement & Export */}
        <Card className="shadow-sm border-slate-200">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-lg text-slate-800">
                   <FileAxis3d className="w-5 h-5 mr-2 text-indigo-600" /> Movement & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2 flex items-center"><Activity className="w-3 h-3 mr-1"/> Movement Logs</h4>
                    {isEmptyData(rabbit.movementLogs) ? (
                      <p className="text-sm text-slate-400 italic">No records yet</p>
                    ) : (
                      <div className="space-y-2">
                        {formatEntries(rabbit.movementLogs).map((m: any, i: number) => (
                          <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                            <span className="text-slate-700">{m.from} → {m.to}</span>
                            {m.date && <span className="text-slate-400 ml-2 text-xs">{m.date}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2 flex items-center"><Truck className="w-3 h-3 mr-1"/> Slaughter / Export</h4>
                    {isEmptyData(rabbit.slaughterExportData) ? (
                      <p className="text-sm text-slate-400 italic">No data recorded</p>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm space-y-1">
                        {(rabbit.slaughterExportData as any).destination && <p><span className="text-slate-500">Destination:</span> <span className="font-medium">{(rabbit.slaughterExportData as any).destination}</span></p>}
                        {(rabbit.slaughterExportData as any).date && <p><span className="text-slate-500">Date:</span> {(rabbit.slaughterExportData as any).date}</p>}
                        {(rabbit.slaughterExportData as any).approved !== undefined && <p><span className="text-slate-500">Approved:</span> {(rabbit.slaughterExportData as any).approved ? "✅ Yes" : "❌ No"}</p>}
                        {(rabbit.slaughterExportData as any).notes && <p><span className="text-slate-500">Notes:</span> {(rabbit.slaughterExportData as any).notes}</p>}
                      </div>
                    )}
                 </div>
              </CardContent>
        </Card>

        {/* Financial */}
        {(Number(rabbit.finalValue) > 0 || rabbit.collateralStatus) && (
          <Card className="shadow-sm border-slate-200">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="flex items-center text-lg text-slate-800">
                     <DollarSign className="w-5 h-5 mr-2 text-amber-600" /> Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-wrap gap-8">
                   <div>
                      <p className="text-sm text-slate-500 font-medium">Collateral Status</p>
                      <Badge className={`mt-1 ${rabbit.collateralStatus ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`} variant="secondary">
                        {rabbit.collateralStatus ? "Under Collateral" : "Free Asset"}
                      </Badge>
                   </div>
                   {Number(rabbit.finalValue) > 0 && (
                     <div>
                        <p className="text-sm text-slate-500 font-medium">Final Value / Sale Price</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">${Number(rabbit.finalValue).toLocaleString()}</p>
                     </div>
                   )}
                </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-8">
          <p>Agri-Trust Registry • Verified Record • ID: {rabbit.uniqueId}</p>
          <p className="mt-1">Owner Digital ID: {rabbit.ownerDigitalId} • Last updated: {new Date(rabbit.updatedAt).toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
}
