import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const cows = await prisma.cow.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-900 tracking-tight">
            Agri-Trust Admin
          </h1>
          <p className="text-slate-500 mt-1">Manage livestock tracking data.</p>
        </div>
        <Link href="/admin/cows/new">
          <Button className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> Add Livestock
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unique ID</TableHead>
              <TableHead>Species & Breed</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No livestock records found. Add your first animal to get started.
                </TableCell>
              </TableRow>
            ) : (
              cows.map((cow: any) => (
                <TableRow key={cow.id}>
                  <TableCell className="font-mono text-xs">
                    {cow.uniqueId}
                  </TableCell>
                  <TableCell>
                    {cow.species} - {cow.breed}
                  </TableCell>
                  <TableCell>{cow.gender}</TableCell>
                  <TableCell>
                    <Badge variant={cow.collateralStatus ? "destructive" : "secondary"}>
                      {cow.collateralStatus ? "Collateral" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex gap-2">
                       <Link href={`/admin/cows/${cow.id}/edit`}>
                         <Button variant="outline" size="sm">Edit</Button>
                       </Link>
                       <Link href={`/cow/${cow.id}`} target="_blank">
                         <Button variant="ghost" size="sm">View Public</Button>
                       </Link>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
