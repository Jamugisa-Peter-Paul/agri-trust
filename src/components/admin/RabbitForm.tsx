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

type BaseEntry = { _isOld?: boolean };
type VaccineEntry = BaseEntry & { vaccine: string; date: string; vet: string };
type WeightEntry = BaseEntry & { date: string; kg: string };
type TreatmentEntry = BaseEntry & { treatment: string; date: string; notes: string };
type ReproEntry = BaseEntry & { event: string; date: string; notes: string };
type MovementEntry = BaseEntry & { from: string; to: string; date: string };

function DynamicList<T extends BaseEntry & Record<string, any>>({
  label,
  entries,
  onChange,
  emptyEntry,
  fields: fieldDefs,
}: {
  label: string;
  fields: { key: keyof Omit<T, "_isOld">; label: string; type?: string; placeholder: string; options?: string[] }[];
  entries: T[];
  onChange: (entries: T[]) => void;
  emptyEntry: Omit<T, "_isOld">;
}) {
  const addEntry = () => onChange([...entries, { ...emptyEntry } as unknown as T]);
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
      {entries.map((entry, i) => {
        const isLocked = entry._isOld;
        return (
          <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${isLocked ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-100"}`}>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {fieldDefs.map((f) => {
                if (f.options) {
                  const currentValue = (entry[f.key as keyof T] as string) || "";
                  const baseOptions = [...f.options];
                  const hasOtherOpt = baseOptions.includes("Other");
                  const isCustom = hasOtherOpt && currentValue && !baseOptions.filter(o => o !== "Other").includes(currentValue);
                  const selectValue = isCustom ? "Other" : currentValue;
                  
                  return (
                    <div key={String(f.key)} className="flex flex-col gap-2">
                      <Select
                        value={selectValue}
                        onValueChange={(val) => updateEntry(i, f.key as keyof T, val)}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="text-sm h-9 bg-white">
                          <SelectValue placeholder={f.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {baseOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectValue === "Other" && (
                        <Input
                          placeholder="Please specify"
                          value={isCustom && currentValue !== "Other" ? currentValue : ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateEntry(i, f.key as keyof T, v === "" ? "Other" : v);
                          }}
                          className="text-sm h-9"
                          disabled={isLocked}
                          autoFocus
                        />
                      )}
                    </div>
                  );
                }
                return (
                  <div key={String(f.key)} className="flex flex-col gap-2">
                    <Input
                      type={f.type || "text"}
                      placeholder={f.placeholder}
                      value={entry[f.key as keyof T] as string}
                      onChange={(e) => updateEntry(i, f.key as keyof T, e.target.value)}
                      className="text-sm h-9"
                      disabled={isLocked}
                    />
                  </div>
                );
              })}
            </div>
            {!isLocked ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(i)} className="h-9 w-9 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="h-9 w-9 shrink-0"></div>
            )}
          </div>
        );
      })}
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
  let list = fallback;
  if (Array.isArray(data)) list = data;
  else if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      list = Array.isArray(parsed) ? parsed : [parsed];
    } catch { }
  } else if (typeof data === "object" && data !== null && Object.keys(data).length > 0) {
    list = [data as unknown as T];
  }
  
  // Mark existing records as old so they become immutable
  return list.map(item => ({ ...item, _isOld: true }));
}

function parseObj<T>(data: any, fallback: T): T {
  let obj = fallback;
  if (typeof data === "string") {
    try { obj = JSON.parse(data) as T; } catch { }
  } else if (typeof data === "object" && data !== null && Object.keys(data).length > 0) {
    obj = data as T;
  }
  return obj;
}

// ───── Zod schema ─────

const rabbitSchema = z.object({
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

type RabbitFormValues = z.infer<typeof rabbitSchema>;

// ───── Main form ─────

export function RabbitForm({ initialData = null, rabbitId = null }: { initialData?: any; rabbitId?: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!rabbitId;

  // Structured state for dynamic JSON fields
  const [vaccinations, setVaccinations] = useState<VaccineEntry[]>(parseList(initialData?.vaccinationRecords, []));
  const [weights, setWeights] = useState<WeightEntry[]>(parseList(initialData?.weightHistory, []));
  const [treatments, setTreatments] = useState<TreatmentEntry[]>(parseList(initialData?.medicalTreatments, []));
  const [reproHistory, setReproHistory] = useState<ReproEntry[]>(parseList(initialData?.reproductiveHistory, []));
  const [movements, setMovements] = useState<MovementEntry[]>(parseList(initialData?.movementLogs, []));
  
  const initialSlaughter = parseObj(initialData?.slaughterExportData, { destination: "", approved: false, date: "", notes: "" });
  const [slaughterExport, setSlaughterExport] = useState(initialSlaughter);
  // Lock slaughter if it already had a destination or date saved
  const isSlaughterLocked = isEditing && (!!initialSlaughter.destination || !!initialSlaughter.date);
  
  // Lock collateral if it was already checked
  const isCollateralLocked = isEditing && initialData?.collateralStatus === true;
  // Lock final value if it was already > 0
  const isValueLocked = isEditing && Number(initialData?.finalValue) > 0;

  const form = useForm<RabbitFormValues>({
    resolver: zodResolver(rabbitSchema),
    defaultValues: {
      species: initialData?.species || "Rabbit",
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

  async function onSubmit(values: RabbitFormValues) {
    setIsLoading(true);
    try {
      const url = rabbitId ? `/api/rabbits/${rabbitId}` : "/api/rabbits";
      const method = rabbitId ? "PATCH" : "POST";

      const stripFlags = <T extends BaseEntry>(list: T[]) => {
        return list
          .filter(entry => {
            const copy = { ...entry };
            delete copy._isOld;
            return Object.values(copy).some(v => (v as any) !== "" && v !== undefined);
          })
          .map(entry => {
            const { _isOld, ...rest } = entry;
            return rest;
          });
      };

      const hasSlaughterData = slaughterExport.destination || slaughterExport.date || slaughterExport.notes;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          vaccinationRecords: stripFlags(vaccinations),
          weightHistory: stripFlags(weights),
          medicalTreatments: stripFlags(treatments),
          reproductiveHistory: stripFlags(reproHistory),
          movementLogs: stripFlags(movements),
          slaughterExportData: hasSlaughterData ? slaughterExport : {},
        }),
      });

      if (!response.ok) throw new Error("Failed to save data");

      const saved = await response.json();
      
      if (!rabbitId) {
        router.push(`/admin/rabbits/${saved.id}/edit`);
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
        <CollapsibleSection title="Basic Information (Permanent)" icon={<span className="text-lg">🐇</span>} defaultOpen={true}>
          {isEditing && (
             <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded mb-4">
                This rabbit profile has been registered. Basic information is locked and cannot be changed.
             </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="species" render={({ field }) => {
              const baseOptions = ["Rabbit", "Hare", "Guinea Pig", "Other"];
              const isCustom = field.value && !baseOptions.filter(o => o !== "Other").includes(field.value);
              const selectValue = isCustom ? "Other" : field.value;
              return (
              <FormItem>
                <FormLabel className="text-slate-700">Species *</FormLabel>
                <div className="flex flex-col gap-2">
                  <Select onValueChange={field.onChange} value={selectValue} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select species" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {baseOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectValue === "Other" && (
                    <FormControl>
                      <Input 
                        placeholder="Please specify species" 
                        value={isCustom && field.value !== "Other" ? field.value : ""} 
                        onChange={e => {
                          const v = e.target.value;
                          field.onChange(v === "" ? "Other" : v);
                        }} 
                        disabled={isEditing} 
                        autoFocus
                      />
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}} />
            <FormField control={form.control} name="breed" render={({ field }) => {
              const baseOptions = ["New Zealand White", "Flemish Giant", "Californian", "Chinchilla", "Rex", "Angora", "Dutch", "English Spot", "Silver Fox", "Harlequin", "Lionhead", "Crossbreed", "Other"];
              const isCustom = field.value && !baseOptions.filter(o => o !== "Other").includes(field.value);
              const selectValue = isCustom ? "Other" : field.value;
              return (
              <FormItem>
                <FormLabel className="text-slate-700">Breed *</FormLabel>
                <div className="flex flex-col gap-2">
                  <Select onValueChange={field.onChange} value={selectValue} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select breed" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {baseOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectValue === "Other" && (
                    <FormControl>
                      <Input 
                        placeholder="Please specify breed" 
                        value={isCustom && field.value !== "Other" ? field.value : ""} 
                        onChange={e => {
                          const v = e.target.value;
                          field.onChange(v === "" ? "Other" : v);
                        }} 
                        disabled={isEditing} 
                        autoFocus
                      />
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}} />
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Date of Birth *</FormLabel>
                <FormControl><Input type="date" disabled={isEditing} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Gender *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                  <FormControl>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Female">Doe (Female)</SelectItem>
                    <SelectItem value="Male">Buck (Male)</SelectItem>
                    <SelectItem value="Castrated">Castrated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ownerName" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Owner&apos;s Name *</FormLabel>
                <FormControl><Input placeholder="e.g. John Mugisha" disabled={isEditing} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Location *</FormLabel>
                <FormControl><Input placeholder="e.g. Mbarara Farm" disabled={isEditing} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="animalImage" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Rabbit Photo URL</FormLabel>
                <FormControl><Input placeholder="https://example.com/photo.jpg" disabled={isEditing} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="feedType" render={({ field }) => {
              const baseOptions = ["Commercial Pellets", "Hay (Timothy, Alfalfa, Meadow)", "Fresh Vegetables/Greens", "Mixed Forage", "Other"];
              const isCustom = field.value && !baseOptions.filter(o => o !== "Other").includes(field.value);
              const selectValue = isCustom ? "Other" : field.value;
              return (
              <FormItem>
                <FormLabel className="text-slate-700">Feed Type *</FormLabel>
                <div className="flex flex-col gap-2">
                  <Select onValueChange={field.onChange} value={selectValue} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select feed type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {baseOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectValue === "Other" && (
                    <FormControl>
                      <Input 
                        placeholder="Please specify feed type" 
                        value={isCustom && field.value !== "Other" ? field.value : ""} 
                        onChange={e => {
                          const v = e.target.value;
                          field.onChange(v === "" ? "Other" : v);
                        }} 
                        disabled={isEditing} 
                        autoFocus
                      />
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}} />
          </div>
        </CollapsibleSection>

        {/* Section 2: Health & Medical */}
        <CollapsibleSection title="Health & Medical Records" icon={<Syringe className="h-5 w-5 text-green-600" />} defaultOpen={!!rabbitId}>
          <DynamicList<VaccineEntry>
            label="Vaccination Records"
            entries={vaccinations}
            onChange={setVaccinations}
            emptyEntry={{ vaccine: "", date: "", vet: "" }}
            fields={[
              { key: "vaccine", label: "Vaccine", placeholder: "Select Vaccine", options: ["RHDV1", "RHDV2", "Myxomatosis", "Nobivac Myxo-RHD PLUS", "Pasteurella (Snuffles)", "Other"] },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "vet", label: "Vet", placeholder: "Veterinarian" },
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
              { key: "kg", label: "Weight (kg)", placeholder: "Weight" },
            ]}
          />
          <hr className="border-slate-100" />
          <DynamicList<TreatmentEntry>
            label="Medical Treatments"
            entries={treatments}
            onChange={setTreatments}
            emptyEntry={{ treatment: "", date: "", notes: "" }}
            fields={[
              { key: "treatment", label: "Treatment", placeholder: "Select Treatment", options: ["Deworming", "Antibiotics", "Anti-inflammatory", "Mite/Flea Treatment", "Coccidiosis Treatment", "Digestive Support (GI Stasis)", "Wound Care", "Other"] },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
              { key: "notes", label: "Notes", placeholder: "Notes" },
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
              { key: "event", label: "Event", placeholder: "Select Event", options: ["Mating / Breeding", "Palpation (Pregnancy Check)", "Nest Box Provided", "Kindling (Birth)", "Weaning", "Fostering", "Other"] },
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
              { key: "from", label: "From", placeholder: "Origin" },
              { key: "to", label: "To", placeholder: "Destination" },
              { key: "date", label: "Date", type: "date", placeholder: "Date" },
            ]}
          />
        </CollapsibleSection>

        {/* Section 4: Financial & Compliance */}
        <CollapsibleSection title="Financial & Compliance" icon={<DollarSign className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="collateralStatus" render={({ field }) => (
              <FormItem className={`flex flex-row items-center gap-3 space-y-0 rounded-md border p-4 ${isCollateralLocked ? "bg-slate-50" : ""}`}>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isCollateralLocked}
                    className="h-4 w-4 rounded border-slate-300 disabled:opacity-50"
                  />
                </FormControl>
                <div>
                  <FormLabel className="text-slate-700">Used as Collateral {isCollateralLocked && "(Locked)"}</FormLabel>
                  <FormDescription>Check if under a loan agreement</FormDescription>
                </div>
              </FormItem>
            )} />
            <FormField control={form.control} name="finalValue" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Final Value / Sale Price ($) {isValueLocked && "(Locked)"}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)} 
                    disabled={isValueLocked} 
                  />
                </FormControl>
                <FormDescription>Set when the rabbit is sold</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Slaughter / Export Data {isSlaughterLocked && "(Locked)"}</p>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border ${isSlaughterLocked ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-100"}`}>
              <Input
                placeholder="Destination (e.g. Export)"
                value={slaughterExport.destination}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, destination: e.target.value })}
                className="text-sm"
                disabled={isSlaughterLocked}
              />
              <Input
                type="date"
                value={slaughterExport.date}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, date: e.target.value })}
                className="text-sm"
                disabled={isSlaughterLocked}
              />
              <Input
                placeholder="Notes"
                value={slaughterExport.notes}
                onChange={(e) => setSlaughterExport({ ...slaughterExport, notes: e.target.value })}
                className="text-sm"
                disabled={isSlaughterLocked}
              />
              <label className={`flex items-center gap-2 text-sm px-1 ${isSlaughterLocked ? "text-slate-400" : "text-slate-600"}`}>
                <input
                  type="checkbox"
                  checked={slaughterExport.approved}
                  onChange={(e) => setSlaughterExport({ ...slaughterExport, approved: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 disabled:opacity-50"
                  disabled={isSlaughterLocked}
                />
                Approved for export
              </label>
            </div>
            <p className="text-xs text-slate-400">Fill when the animal is sent for slaughter or export</p>
          </div>
        </CollapsibleSection>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-2">
          {isLoading ? "Saving..." : rabbitId ? "Update Rabbit Record" : "Register Rabbit"}
        </Button>
      </form>
    </Form>
  );
}
