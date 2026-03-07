import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RabbitForm } from "@/components/admin/RabbitForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewRabbitPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-900 tracking-tight">Register New Rabbit</h1>
        <p className="text-slate-500 mt-1">Enter the details for the new rabbit. An Agri-Trust ID will be automatically generated.</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <RabbitForm />
      </div>
    </div>
  );
}
