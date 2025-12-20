import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CreateMedicalRecordFormProps {
  patientId?: string;
}

export function CreateMedicalRecordForm({
  patientId,
}: CreateMedicalRecordFormProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    patientId: patientId || "",
    appointmentId: "",
    recordType: "consultation",
    title: "",
    description: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    oxygenSaturation: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    medications: "",
    dosage: "",
    instructions: "",
    labResults: "",
    imagingResults: "",
    followUpRequired: false,
    followUpDate: "",
    followUpNotes: "",
  });

  const createMedicalRecord = trpc["medical-records"].create.useMutation({
    onSuccess: () => {
      toast.success("Medical record created successfully");
      setOpen(false);
      setFormData({
        patientId: patientId?.toString() || "",
        appointmentId: "",
        recordType: "consultation",
        title: "",
        description: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: "",
        height: "",
        oxygenSaturation: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        medications: "",
        dosage: "",
        instructions: "",
        labResults: "",
        imagingResults: "",
        followUpRequired: false,
        followUpDate: "",
        followUpNotes: "",
      });
      // Invalidate medical records queries to refresh the list
      if (patientId) {
        utils["medical-records"].getByPatientId.invalidate({ patientId });
      }
      utils["medical-records"].getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create medical record");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { followUpDate, ...submitData } = formData;
    createMedicalRecord.mutate({
      ...submitData,
      patientId: formData.patientId,
      appointmentId: formData.appointmentId || undefined,
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      oxygenSaturation: formData.oxygenSaturation
        ? parseInt(formData.oxygenSaturation)
        : undefined,
      recordType: formData.recordType as
        | "consultation"
        | "examination"
        | "lab_result"
        | "imaging"
        | "prescription"
        | "procedure"
        | "vaccination",
      ...(followUpDate && { followUpDate: new Date(followUpDate) }),
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Record</DialogTitle>
          <DialogDescription>
            Enter the medical record's information below. All fields marked with
            * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!patientId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID *</Label>
                <Input
                  id="patientId"
                  type="number"
                  min="1"
                  value={formData.patientId}
                  onChange={(e) =>
                    handleInputChange("patientId", e.target.value)
                  }
                  required
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <Label htmlFor="appointmentId">Appointment ID</Label>
                <Input
                  id="appointmentId"
                  type="number"
                  min="1"
                  value={formData.appointmentId}
                  onChange={(e) =>
                    handleInputChange("appointmentId", e.target.value)
                  }
                  placeholder="Enter appointment ID (optional)"
                />
              </div>
            </div>
          )}

          {patientId && (
            <div>
              <Label htmlFor="appointmentId">Appointment ID</Label>
              <Input
                id="appointmentId"
                type="number"
                min="1"
                value={formData.appointmentId}
                onChange={(e) =>
                  handleInputChange("appointmentId", e.target.value)
                }
                placeholder="Enter appointment ID (optional)"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recordType">Record Type *</Label>
              <Select
                value={formData.recordType}
                onValueChange={(value) =>
                  handleInputChange("recordType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="examination">Examination</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                placeholder="Enter record title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter record description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bloodPressure">Blood Pressure</Label>
              <Input
                id="bloodPressure"
                value={formData.bloodPressure}
                onChange={(e) =>
                  handleInputChange("bloodPressure", e.target.value)
                }
                placeholder="e.g., 120/80"
              />
            </div>
            <div>
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                min="0"
                value={formData.heartRate}
                onChange={(e) => handleInputChange("heartRate", e.target.value)}
                placeholder="e.g., 72"
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", e.target.value)
                }
                placeholder="e.g., 36.8"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="e.g., 70.5"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="e.g., 175.0"
              />
            </div>
            <div>
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                min="0"
                max="100"
                value={formData.oxygenSaturation}
                onChange={(e) =>
                  handleInputChange("oxygenSaturation", e.target.value)
                }
                placeholder="e.g., 98"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              placeholder="Enter patient symptoms..."
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("diagnosis", e.target.value)}
              placeholder="Enter diagnosis..."
            />
          </div>

          <div>
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleInputChange("treatment", e.target.value)}
              placeholder="Enter treatment plan..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) =>
                  handleInputChange("medications", e.target.value)
                }
                placeholder="Enter prescribed medications..."
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Textarea
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                placeholder="Enter medication dosage..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                handleInputChange("instructions", e.target.value)
              }
              placeholder="Enter patient instructions..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="labResults">Lab Results</Label>
              <Textarea
                id="labResults"
                value={formData.labResults}
                onChange={(e) =>
                  handleInputChange("labResults", e.target.value)
                }
                placeholder="Enter lab results..."
              />
            </div>
            <div>
              <Label htmlFor="imagingResults">Imaging Results</Label>
              <Textarea
                id="imagingResults"
                value={formData.imagingResults}
                onChange={(e) =>
                  handleInputChange("imagingResults", e.target.value)
                }
                placeholder="Enter imaging results..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) =>
                  handleInputChange("followUpDate", e.target.value)
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="followUpRequired"
                type="checkbox"
                checked={formData.followUpRequired}
                onChange={(e) =>
                  handleInputChange("followUpRequired", e.target.checked)
                }
                className="rounded"
              />
              <Label htmlFor="followUpRequired">Follow-up Required</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="followUpNotes">Follow-up Notes</Label>
            <Textarea
              id="followUpNotes"
              value={formData.followUpNotes}
              onChange={(e) =>
                handleInputChange("followUpNotes", e.target.value)
              }
              placeholder="Enter follow-up notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMedicalRecord.isPending}>
              {createMedicalRecord.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Medical Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
