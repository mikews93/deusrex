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

export function CreateHealthProfessionalForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "doctor",
    specialty: "",
    licenseNumber: "",
    npi: "",
    bio: "",
    education: "",
    certifications: "",
    languages: "",
    isActive: true,
    isAvailable: true,
  });

  const utils = trpc.useUtils();

  const createHealthProfessional = trpc[
    "health-professionals"
  ].create.useMutation({
    onSuccess: () => {
      toast.success("Health professional created successfully");
      setOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        type: "doctor",
        specialty: "",
        licenseNumber: "",
        npi: "",
        bio: "",
        education: "",
        certifications: "",
        languages: "",
        isActive: true,
        isAvailable: true,
      });
      // Invalidate and refetch health professionals list
      utils["health-professionals"].getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create health professional");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse languages if provided
    const languagesArray = formData.languages
      ? formData.languages.split(",").map((lang) => lang.trim())
      : [];

    createHealthProfessional.mutate({
      ...formData,
      languages:
        languagesArray.length > 0 ? JSON.stringify(languagesArray) : undefined,
      specialty: formData.specialty || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      npi: formData.npi || undefined,
      bio: formData.bio || undefined,
      education: formData.education || undefined,
      certifications: formData.certifications || undefined,
      phone: formData.phone || undefined,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const healthProfessionalTypes = [
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "specialist", label: "Specialist" },
    { value: "therapist", label: "Therapist" },
    { value: "technician", label: "Technician" },
    { value: "administrator", label: "Administrator" },
  ];

  const specialties = [
    { value: "general_practice", label: "General Practice" },
    { value: "cardiology", label: "Cardiology" },
    { value: "dermatology", label: "Dermatology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "psychiatry", label: "Psychiatry" },
    { value: "radiology", label: "Radiology" },
    { value: "surgery", label: "Surgery" },
    { value: "emergency_medicine", label: "Emergency Medicine" },
    { value: "internal_medicine", label: "Internal Medicine" },
    { value: "family_medicine", label: "Family Medicine" },
    { value: "oncology", label: "Oncology" },
    { value: "gynecology", label: "Gynecology" },
    { value: "urology", label: "Urology" },
    { value: "ophthalmology", label: "Ophthalmology" },
    { value: "otolaryngology", label: "Otolaryngology" },
    { value: "anesthesiology", label: "Anesthesiology" },
    { value: "pathology", label: "Pathology" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Health Professional
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Health Professional</DialogTitle>
          <DialogDescription>
            Enter the health professional's information below. All fields marked
            with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {healthProfessionalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => handleInputChange("specialty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                placeholder="Enter license number"
              />
            </div>
            <div>
              <Label htmlFor="npi">NPI</Label>
              <Input
                id="npi"
                value={formData.npi}
                onChange={(e) => handleInputChange("npi", e.target.value)}
                placeholder="Enter NPI number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Enter professional bio..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              placeholder="Enter education background..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={formData.certifications}
              onChange={(e) =>
                handleInputChange("certifications", e.target.value)
              }
              placeholder="Enter certifications..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="languages">Languages</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => handleInputChange("languages", e.target.value)}
              placeholder="Enter languages (comma-separated)"
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
            <Button type="submit" disabled={createHealthProfessional.isPending}>
              {createHealthProfessional.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Health Professional"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
