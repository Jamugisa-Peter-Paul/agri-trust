import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rabbits = await prisma.rabbit.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-900 tracking-tight">Rabbitry Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage and track your registered rabbits.</p>
        </div>
        <Link href="/admin/rabbits/new">
          <Button className="bg-green-700 hover:bg-green-800 text-white font-semibold flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Rabbit Record
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow>
              <TableHead className="w-[120px] font-semibold text-slate-700">Rabbit ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Breed / Species</TableHead>
              <TableHead className="font-semibold text-slate-700">Owner Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rabbits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="text-4xl">🐇</span>
                    <p>No rabbits registered yet.</p>
                    <Link href="/admin/rabbits/new">
                       <Button variant="outline" size="sm" className="mt-2 border-green-200 text-green-700 hover:bg-green-50">Register First Rabbit</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rabbits.map((rabbit) => (
                <TableRow key={rabbit.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-sm font-medium text-slate-900">
                    {rabbit.uniqueId}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{rabbit.breed}</div>
                    <div className="text-xs text-slate-500">{rabbit.species}</div>
                  </TableCell>
                  <TableCell className="text-slate-600">{rabbit.ownerName}</TableCell>
                  <TableCell>
                    <Badge className={`${rabbit.collateralStatus ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'} font-normal border-0`}>
                      {rabbit.collateralStatus ? "Under Collateral" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/rabbits/${rabbit.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium">
                        View / Edit
                      </Button>
                    </Link>
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
