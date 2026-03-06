import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CowForm } from "@/components/admin/CowForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewCowPage() {
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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 tracking-tight mb-2">Register New Livestock</h1>
        <p className="text-slate-500 mb-8">Enter the details of the new animal to add it to the Agri-Trust registry.</p>
        
        <CowForm />
      </div>
    </div>
  );
}
