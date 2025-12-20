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
  Stethoscope,
  Award,
  Clock,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { HealthProfessional, HealthProfessionalType } from "@/types";

interface HealthProfessionalFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  specialty: string;
  licenseNumber: string;
  bio: string;
  isAvailable: boolean;
  workingHours: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const initialFormData: Partial<HealthProfessional> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: HealthProfessionalType.DOCTOR,
  specialty: "general_practice",
  licenseNumber: "",
  bio: "",
  isAvailable: true,
  workingHours: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
};

const HealthProfessionalProfile = () => {
  const { health_professional_id } = useParams<{
    health_professional_id: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] =
    useState<Partial<HealthProfessional>>(initialFormData);

  // Fetch health professional data
  const {
    data: healthProfessional,
    isLoading,
    error,
  } = trpc["health-professionals"].getById.useQuery(
    { id: health_professional_id! },
    { enabled: !!health_professional_id }
  );

  // Update mutation
  const updateHealthProfessional = trpc[
    "health-professionals"
  ].update.useMutation({
    onSuccess: () => {
      toast.success("Health professional updated successfully");
      setIsEditing(false);
      // Update URL to remove edit parameter after successful save
      navigate(`/health-professionals/${health_professional_id}`, {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update health professional");
    },
  });

  // Set edit mode based on URL parameter
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Populate form data when health professional data is loaded
  useEffect(() => {
    if (healthProfessional) {
      setFormData({
        ...initialFormData,
        firstName: healthProfessional.firstName,
        lastName: healthProfessional.lastName,
        email: healthProfessional.email,
        phone: healthProfessional.phone,
        type: healthProfessional.type,
        specialty: healthProfessional.specialty,
        licenseNumber: healthProfessional.licenseNumber,
        bio: healthProfessional.bio,
        isAvailable: healthProfessional.isAvailable ?? true,
        workingHours: healthProfessional.workingHours,
        address: healthProfessional.address,
        city: healthProfessional.city,
        state: healthProfessional.state,
        zipCode: healthProfessional.zipCode,
      });
    }
  }, [healthProfessional]);

  const handleInputChange = (
    field: keyof HealthProfessionalFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!health_professional_id) return;

    updateHealthProfessional.mutate({
      id: health_professional_id,
      data: formData,
    });
  };

  const handleCancel = () => {
    if (healthProfessional) {
      setFormData({
        ...initialFormData,
        firstName: healthProfessional.firstName,
        lastName: healthProfessional.lastName,
        email: healthProfessional.email,
        phone: healthProfessional.phone,
        type: healthProfessional.type,
        specialty: healthProfessional.specialty,
        licenseNumber: healthProfessional.licenseNumber,
        bio: healthProfessional.bio,
        isAvailable: healthProfessional.isAvailable ?? true,
        workingHours: healthProfessional.workingHours,
        address: healthProfessional.address,
        city: healthProfessional.city,
        state: healthProfessional.state,
        zipCode: healthProfessional.zipCode,
      });
    }
    setIsEditing(false);
    navigate(`/health-professionals/${health_professional_id}`, {
      replace: true,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "nurse":
        return "bg-green-100 text-green-800";
      case "specialist":
        return "bg-purple-100 text-purple-800";
      case "therapist":
        return "bg-orange-100 text-orange-800";
      case "technician":
        return "bg-yellow-100 text-yellow-800";
      case "administrator":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
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

  if (error || !healthProfessional) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Health Professional Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The health professional you're looking for doesn't exist or
                  has been removed.
                </p>
                <Button onClick={() => navigate("/health-professionals")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Health Professionals
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/health-professionals")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {isEditing
                        ? "Edit Health Professional"
                        : "Health Professional Profile"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {isEditing
                        ? "Update health professional information"
                        : "View and manage health professional details"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateHealthProfessional.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={updateHealthProfessional.isPending}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        {updateHealthProfessional.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                          {healthProfessional.firstName?.charAt(0)}
                          {healthProfessional.lastName?.charAt(0)}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {healthProfessional.firstName}{" "}
                          {healthProfessional.lastName}
                        </h2>
                        <div className="space-y-2 mb-4">
                          <Badge
                            className={`${getTypeColor(
                              healthProfessional.type
                            )}`}
                          >
                            {healthProfessional.type?.charAt(0).toUpperCase() +
                              healthProfessional.type?.slice(1)}
                          </Badge>
                          <Badge
                            className={`${getAvailabilityColor(
                              healthProfessional.isAvailable
                            )}`}
                          >
                            {healthProfessional.isAvailable
                              ? "Available"
                              : "Busy"}
                          </Badge>
                        </div>
                        {healthProfessional.specialty && (
                          <p className="text-sm text-gray-600 mb-2">
                            <Stethoscope className="h-4 w-4 inline mr-1" />
                            {healthProfessional.specialty}
                          </p>
                        )}
                        {healthProfessional.licenseNumber && (
                          <p className="text-sm text-gray-600">
                            <Award className="h-4 w-4 inline mr-1" />
                            License: {healthProfessional.licenseNumber}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.firstName || "Not provided"}
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
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.lastName || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {healthProfessional.email || "Not provided"}
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
                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {healthProfessional.phone || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          {isEditing ? (
                            <Input
                              id="type"
                              value={formData.type}
                              onChange={(e) =>
                                handleInputChange("type", e.target.value)
                              }
                            />
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.type || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="specialty">Specialty</Label>
                          {isEditing ? (
                            <Input
                              id="specialty"
                              value={formData.specialty}
                              onChange={(e) =>
                                handleInputChange("specialty", e.target.value)
                              }
                            />
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.specialty || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="licenseNumber">License Number</Label>
                        {isEditing ? (
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) =>
                              handleInputChange("licenseNumber", e.target.value)
                            }
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">
                            {healthProfessional.licenseNumber || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                              handleInputChange("bio", e.target.value)
                            }
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">
                            {healthProfessional.bio || "No bio provided"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Professional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="isAvailable">Availability</Label>
                          {isEditing ? (
                            <select
                              id="isAvailable"
                              value={formData.isAvailable.toString()}
                              onChange={(e) =>
                                handleInputChange(
                                  "isAvailable",
                                  e.target.value === "true"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="true">Available</option>
                              <option value="false">Busy</option>
                            </select>
                          ) : (
                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {healthProfessional.isAvailable
                                ? "Available"
                                : "Busy"}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="workingHours">Working Hours</Label>
                          {isEditing ? (
                            <Input
                              id="workingHours"
                              value={formData.workingHours}
                              onChange={(e) =>
                                handleInputChange(
                                  "workingHours",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 9:00 AM - 5:00 PM"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.workingHours ||
                                "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
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
                          <p className="text-sm text-gray-900 mt-1">
                            {healthProfessional.address || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.city || "Not provided"}
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
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.state || "Not provided"}
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
                            <p className="text-sm text-gray-900 mt-1">
                              {healthProfessional.zipCode || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HealthProfessionalProfile;
