"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Syringe, Activity, DollarSign, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

// ───── Dynamic list sub-components ─────

type VaccineEntry = { vaccine: string; date: string; vet: string };
type WeightEntry = { date: string; kg: string };
type TreatmentEntry = { treatment: string; date: string; notes: string };
type ReproEntry = { event: string; date: string; notes: string };
type MovementEntry = { from: string; to: string; date: string };

function DynamicList<T extends Record<string, string>>({
  label,
  entries,
  onChange,
  emptyEntry,
  fields: fieldDefs,
}: {
  label: string;
  fields: { key: keyof T; label: string; type?: string; placeholder: string }[];
  entries: T[];
  onChange: (entries: T[]) => void;
  emptyEntry: T;
}) {
  const addEntry = () => onChange([...entries, { ...emptyEntry }]);
  const removeEntry = (i: number) => onChange(entries.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, key: keyof T, value: string) => {
    const updated = [...entries];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={addEntry} className="h-8 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      {entries.length === 0 && (
        <p className="text-xs text-slate-400 italic py-2">No entries yet. Click &ldquo;Add&rdquo; to start.</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {fieldDefs.map((f) => (
              <Input
                key={String(f.key)}
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={entry[f.key]}
                onChange={(e) => updateEntry(i, f.key, e.target.value)}
                className="text-sm h-9"
              />
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(i)} className="h-9 w-9 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ───── Collapsible section ─────

function CollapsibleSection({ title, icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {isOpen && <div className="p-5 space-y-5 bg-white">{children}</div>}
    </div>
  );
}

// ───── Helpers ─────

function parseList<T>(data: any, fallback: T[]): T[] {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch { return fallback; }
  }
  if (typeof data === "object" && Object.keys(data).length > 0) return [data as T];
  return fallback;
}

function parseObj<T>(data: any, fallback: T): T {
  if (!data) return fallback;
  if (typeof data === "string") {
    try { return JSON.parse(data) as T; } catch { return fallback; }
  }
  if (typeof data === "object") return data as T;
  return fallback;
}

// ───── Zod schema ─────

const cowSchema = z.object({
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Castrated"]),
  ownerName: z.string().min(1, "Owner name is required"),
  location: z.string().min(1, "Location is required"),
  animalImage: z.string().optional(),
  feedType: z.string().min(1, "Feed type is required"),
  collateralStatus: z.boolean(),
  finalValue: z.number().min(0, "Value must be positive"),
});

type CowFormValues = z.infer<typeof cowSchema>;

// ───── Main form ─────

export function CowForm({ initialData = null, cowId = null }: { initialData?: any; cowId?: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Structured state for dynamic JSON fields
  const [vaccinations, setVaccinations] = useState<VaccineEntry[]>(
    parseList(initialData?.vaccinationRecords, [])
  );
  const [weights, setWeights] = useState<WeightEntry[]>(
    parseList(initialData?.weightHistory, [])
  );
  const [treatments, setTreatments] = useState<TreatmentEntry[]>(
    parseList(initialData?.medicalTreatments, [])
  );
  const [reproHistory, setReproHistory] = useState<ReproEntry[]>(
    parseList(initialData?.reproductiveHistory, [])
  );
  const [movements, setMovements] = useState<MovementEntry[]>(
    parseList(initialData?.movementLogs, [])
  );
  const [slaughterExport, setSlaughterExport] = useState<{
    destination: string; approved: boolean; date: string; notes: string;
  }>(parseObj(initialData?.slaughterExportData, { destination: "", approved: false, date: "", notes: "" }));

  const form = useForm<CowFormValues>({
    resolver: zodResolver(cowSchema),
    defaultValues: {
      species: initialData?.species || "",
      breed: initialData?.breed || "",
      dob: initialData?.dob || new Date().toISOString().split("T")[0],
      gender: initialData?.gender || "Female",
      ownerName: initialData?.ownerName || "",
      location: initialData?.location || "",
      animalImage: initialData?.animalImage || "",
      feedType: initialData?.feedType || "",
      collateralStatus: initialData?.collateralStatus || false,
      finalValue: initialData?.finalValue || 0,
    },
  });

  async function onSubmit(values: CowFormValues) {
    setIsLoading(true);
    try {
      const url = cowId ? `/api/cows/${cowId}` : "/api/cows";
      const method = cowId ? "PATCH" : "POST";

      const cleanList = <T extends Record<string, string>>(list: T[]) =>
        list.filter(entry => Object.values(entry).some(v => v.trim() !== ""));

      const hasSlaughterData = slaughterExport.destination || slaughterExport.date || slaughterExport.notes;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          vaccinationRecords: cleanList(vaccinations).length > 0 ? cleanList(vaccinations) : {},
          weightHistory: cleanList(weights).length > 0 ? cleanList(weights) : {},
          medicalTreatments: cleanList(treatments).length > 0 ? cleanList(treatments) : {},
          reproductiveHistory: cleanList(reproHistory).length > 0 ? cleanList(reproHistory) : {},
          movementLogs: cleanList(movements).length > 0 ? cleanList(movements) : {},
          slaughterExportData: hasSlaughterData ? slaughterExport : {},
        }),
      });

      if (!response.ok) throw new Error("Failed to save data");

      const saved = await response.json();
      
      if (!cowId) {
        router.push(`/admin/cows/${saved.id}/edit`);
      } else {
        router.push("/admin/dashboard");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Section 1: Basic Information */}
        <CollapsibleSection title="Basic Information" icon={<span className="text-lg">🐄</span>} defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="species" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Species *</FormLabel>
                <FormControl><Input placeholder="e.g. Cattle, Goat, Sheep" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breed" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Breed *</FormLabel>
                <FormControl><Input placeholder="e.g. Brahman, Boer" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Date of Birth *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormDescription>Or estimated date if already grown</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Gender *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Castrated">Castrated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ownerName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Owner&apos;s Name *</FormLabel>
                <FormControl><Input placeholder="e.g. John Mugisha" {...field} /></FormControl>
                <FormDescription>A digital owner ID will be generated automatically</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Location *</FormLabel>
                <FormControl><Input placeholder="e.g. Mbarara Farm, Western Uganda" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="animalImage" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Animal Image URL</FormLabel>
                <FormControl><Input placeholder="https://example.com/photo.jpg" {...field} /></FormControl>
                <FormDescription>Link to a photo of the animal</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="feedType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Feed Type *</FormLabel>
                <FormControl><Input placeholder="e.g. Pasture, Grain, Mixed" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </CollapsibleSection>

        {/* Section 2: Health & Medical */}
        <CollapsibleSection title="Health & Medical Records" icon={<Syringe className="h-5 w-5 text-green-600" />} defaultOpen={!!cowId}>
          <DynamicList<VaccineEntry>
            label="Vaccination Records"
            entries={vaccinations}
            onChange={setVaccinations}
            emptyEntry={{ vaccine: "", date: "", vet: "" }}
            fields={[
              { key: "vaccine", label: "Vaccine", placeholder: "e.g. BVD, FMD" },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "vet", label: "Vet", placeholder: "Veterinarian name" },
            ]}
          />
          <hr className="border-slate-100" />
          <DynamicList<WeightEntry>
            label="Weight Gain History"
            entries={weights}
            onChange={setWeights}
            emptyEntry={{ date: "", kg: "" }}
            fields={[
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "kg", label: "Weight (kg)", placeholder: "Weight in kg" },
            ]}
          />
          <hr className="border-slate-100" />
          <DynamicList<TreatmentEntry>
            label="Medical Treatments"
            entries={treatments}
            onChange={setTreatments}
            emptyEntry={{ treatment: "", date: "", notes: "" }}
            fields={[
              { key: "treatment", label: "Treatment", placeholder: "e.g. Deworming" },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "notes", label: "Notes", placeholder: "Additional notes" },
            ]}
          />
        </CollapsibleSection>

        {/* Section 3: Lifecycle */}
        <CollapsibleSection title="Lifecycle & Movement" icon={<Activity className="h-5 w-5 text-blue-600" />} defaultOpen={false}>
          <DynamicList<ReproEntry>
            label="Reproductive History"
            entries={reproHistory}
            onChange={setReproHistory}
            emptyEntry={{ event: "", date: "", notes: "" }}
            fields={[
              { key: "event", label: "Event", placeholder: "e.g. Calving, Mating" },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "notes", label: "Notes", placeholder: "Details" },
            ]}
          />
          <hr className="border-slate-100" />
          <DynamicList<MovementEntry>
            label="Movement Logs"
            entries={movements}
            onChange={setMovements}
            emptyEntry={{ from: "", to: "", date: "" }}
            fields={[
              { key: "from", label: "From", placeholder: "Origin location" },
              { key: "to", label: "To", placeholder: "Destination" },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
            ]}
          />
        </CollapsibleSection>

        {/* Section 4: Financial & Compliance */}
        <CollapsibleSection title="Financial & Compliance" icon={<DollarSign className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="collateralStatus" render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </FormControl>
                <div>
                  <FormLabel className="text-slate-700">Used as Collateral</FormLabel>
                  <FormDescription>Check if under a loan/collateral agreement</FormDescription>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="finalValue" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Final Value / Sale Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
                </FormControl>
                <FormDescription>Set when the animal is sold</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Slaughter / Export Data</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Input
                placeholder="Destination (e.g. Export-Kenya)"
                value={slaughterExport.destination}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, destination: e.target.value })}
                className="text-sm"
              />
              <Input
                type="date"
                value={slaughterExport.date}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, date: e.target.value })}
                className="text-sm"
              />
              <Input
                placeholder="Notes"
                value={slaughterExport.notes}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, notes: e.target.value })}
                className="text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600 px-1">
                <input
                  type="checkbox"
                  checked={slaughterExport.approved}
                  onChange={(e) => setSlaughterExport({ ...slaughterExport, approved: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Approved for export
              </label>
            </div>
            <p className="text-xs text-slate-400">Fill when the animal is sent for slaughter or export</p>
          </div>
        </CollapsibleSection>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-2">
          {isLoading ? "Saving..." : cowId ? "Update Livestock" : "Register Livestock"}
        </Button>
      </form>
    </Form>
  );
}
