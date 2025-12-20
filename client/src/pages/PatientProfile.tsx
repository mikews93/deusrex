import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CreateMedicalRecordForm } from "@/components/forms/CreateMedicalRecordForm";

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  currentMedications: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

const PatientProfile = () => {
  const { patient_id } = useParams<{ patient_id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    currentMedications: "",
    insuranceProvider: "",
    insuranceNumber: "",
  });

  // Fetch patient data
  const {
    data: patient,
    isLoading,
    error,
  } = trpc.patients.getById.useQuery(
    { id: patient_id! },
    { enabled: !!patient_id }
  );

  // Fetch medical records for this patient
  const { data: medicalRecords, isLoading: medicalRecordsLoading } = trpc[
    "medical-records"
  ].getByPatientId.useQuery(
    { patientId: patient_id! },
    { enabled: !!patient_id }
  );

  // Update mutation
  const updatePatient = trpc.patients.update.useMutation({
    onSuccess: () => {
      toast.success("Patient updated successfully");
      setIsEditing(false);
      // Update URL to remove edit parameter after successful save
      navigate(`/patients/${patient_id}`, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update patient");
    },
  });

  // Check for edit mode from URL parameters
  useEffect(() => {
    const editMode = searchParams.get("edit") === "true";
    setIsEditing(editMode);
  }, [searchParams]);

  // Load patient data into form when data is fetched
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        address: patient.address || "",
        city: patient.city || "",
        state: patient.state || "",
        zipCode: patient.zipCode || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        allergies: patient.allergies || "",
        currentMedications: patient.currentMedications || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
      });
    }
  }, [patient]);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!patient_id) return;

    updatePatient.mutate({
      id: patient_id!,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergies: formData.allergies,
        currentMedications: formData.currentMedications,
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
      },
    });
  };

  const handleCancel = () => {
    // Reset form data to original patient data
    if (patient) {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        address: patient.address || "",
        city: patient.city || "",
        state: patient.state || "",
        zipCode: patient.zipCode || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        allergies: patient.allergies || "",
        currentMedications: patient.currentMedications || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
      });
    }
    setIsEditing(false);
    // Update URL to remove edit parameter
    navigate(`/patients/${patient_id}`, { replace: true });
  };

  const handleBack = () => {
    navigate("/patients");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Patient not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  The patient you're looking for doesn't exist or has been
                  removed.
                </p>
                <Button onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Patients
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {isEditing ? "Edit Patient" : "Patient Profile"}
                    </h1>
                    <p className="text-muted-foreground">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        // Update URL to add edit parameter
                        navigate(`/patients/${patient_id}?edit=true`, {
                          replace: true,
                        });
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updatePatient.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={updatePatient.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.firstName || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.lastName || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {patient.email || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {patient.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {patient.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.address || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.city || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      {isEditing ? (
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.state || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      {isEditing ? (
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.zipCode || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="emergencyContactName">
                      Emergency Contact Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactName",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.emergencyContactName || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactPhone",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {patient.emergencyContactPhone || "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="insuranceProvider">
                      Insurance Provider
                    </Label>
                    {isEditing ? (
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={(e) =>
                          handleInputChange("insuranceProvider", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.insuranceProvider || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="insuranceNumber">Insurance Number</Label>
                    {isEditing ? (
                      <Input
                        id="insuranceNumber"
                        value={formData.insuranceNumber}
                        onChange={(e) =>
                          handleInputChange("insuranceNumber", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.insuranceNumber || "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Information */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    {isEditing ? (
                      <Textarea
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) =>
                          handleInputChange("allergies", e.target.value)
                        }
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.allergies || "No known allergies"}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="currentMedications">
                      Current Medications
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="currentMedications"
                        value={formData.currentMedications}
                        onChange={(e) =>
                          handleInputChange(
                            "currentMedications",
                            e.target.value
                          )
                        }
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {patient.currentMedications || "No current medications"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Records Section */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical Records
                    </CardTitle>
                    <CreateMedicalRecordForm patientId={patient_id!} />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search records..."
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {/* Loading State */}
                  {medicalRecordsLoading && (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!medicalRecordsLoading &&
                    (!medicalRecords || medicalRecords.length === 0) && (
                      <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                          <FileText className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No medical records found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Get started by creating your first medical record for
                          this patient.
                        </p>
                        <CreateMedicalRecordForm patientId={patient_id!} />
                      </div>
                    )}

                  {/* Medical Records Grid */}
                  {medicalRecords && medicalRecords.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {medicalRecords.map((record) => (
                        <Card
                          key={record.id}
                          className="hover:shadow-medium transition-shadow cursor-pointer"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {record.title}
                              </CardTitle>
                              <Badge variant="outline">
                                {record.recordType}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">
                                  {record.createdAt
                                    ? new Date(
                                        record.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium">
                                  {record.recordType}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm">
                                Description
                              </p>
                              <p className="font-medium text-sm">
                                {record.description || "No description"}
                              </p>
                            </div>
                            {record.followUpRequired && (
                              <div className="pt-2 border-t">
                                <Badge variant="secondary" className="text-xs">
                                  Follow-up Required
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-2">
                              <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;
