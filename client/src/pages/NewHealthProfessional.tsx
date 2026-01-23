import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HealthProfessionalFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type:
    | "doctor"
    | "nurse"
    | "specialist"
    | "therapist"
    | "technician"
    | "administrator";
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

const NewHealthProfessional = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HealthProfessionalFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "doctor",
    specialty: "",
    licenseNumber: "",
    bio: "",
    isAvailable: true,
    workingHours: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const createHealthProfessional = trpc[
    "health-professionals"
  ].create.useMutation({
    onSuccess: (data) => {
      toast.success("Health professional created successfully");
      navigate(`/health-professionals/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create health professional");
    },
  });

  const handleInputChange = (
    field: keyof HealthProfessionalFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createHealthProfessional.mutate({
      ...formData,
      specialty: (formData.specialty || undefined) as
        | "general_practice"
        | "cardiology"
        | "dermatology"
        | "neurology"
        | "orthopedics"
        | "pediatrics"
        | "psychiatry"
        | "radiology"
        | "surgery"
        | "emergency_medicine"
        | "internal_medicine"
        | "family_medicine"
        | "oncology"
        | "gynecology"
        | "urology"
        | "ophthalmology"
        | "otolaryngology"
        | "anesthesiology"
        | "pathology"
        | "other"
        | undefined,
    });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.type && formData.specialty;
      case 3:
        return true; // Address is optional
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Professional Details", icon: Stethoscope },
    { number: 3, title: "Address & Contact", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                      Add New Health Professional
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Create a new health professional profile
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.number;
                      const isCompleted = currentStep > step.number;
                      const isValid = isStepValid(step.number);

                      return (
                        <div key={step.number} className="flex items-center">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                              isActive
                                ? "border-blue-600 bg-blue-600 text-white"
                                : isCompleted
                                ? "border-green-600 bg-green-600 text-white"
                                : isValid
                                ? "border-green-600 bg-green-100 text-green-600"
                                : "border-gray-300 bg-white text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p
                              className={`text-sm font-medium ${
                                isActive ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              {step.title}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                              <Separator className="h-px" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Form Content */}
              <Card>
                <CardContent className="p-6">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                              handleInputChange("bio", e.target.value)
                            }
                            placeholder="Enter a brief bio"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Professional Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value) =>
                                handleInputChange("type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="specialist">
                                  Specialist
                                </SelectItem>
                                <SelectItem value="therapist">
                                  Therapist
                                </SelectItem>
                                <SelectItem value="technician">
                                  Technician
                                </SelectItem>
                                <SelectItem value="administrator">
                                  Administrator
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="specialty">Specialty *</Label>
                            <Select
                              value={formData.specialty}
                              onValueChange={(value) =>
                                handleInputChange("specialty", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general_medicine">
                                  General Medicine
                                </SelectItem>
                                <SelectItem value="cardiology">
                                  Cardiology
                                </SelectItem>
                                <SelectItem value="dermatology">
                                  Dermatology
                                </SelectItem>
                                <SelectItem value="neurology">
                                  Neurology
                                </SelectItem>
                                <SelectItem value="orthopedics">
                                  Orthopedics
                                </SelectItem>
                                <SelectItem value="pediatrics">
                                  Pediatrics
                                </SelectItem>
                                <SelectItem value="psychiatry">
                                  Psychiatry
                                </SelectItem>
                                <SelectItem value="radiology">
                                  Radiology
                                </SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="emergency_medicine">
                                  Emergency Medicine
                                </SelectItem>
                                <SelectItem value="family_medicine">
                                  Family Medicine
                                </SelectItem>
                                <SelectItem value="internal_medicine">
                                  Internal Medicine
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="licenseNumber">
                              License Number
                            </Label>
                            <Input
                              id="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "licenseNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Enter license number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="workingHours">Working Hours</Label>
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
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="isAvailable">Availability</Label>
                          <Select
                            value={formData.isAvailable.toString()}
                            onValueChange={(value) =>
                              handleInputChange("isAvailable", value === "true")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Available</SelectItem>
                              <SelectItem value="false">Busy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Address & Contact Information
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              placeholder="Enter street address"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) =>
                                  handleInputChange("city", e.target.value)
                                }
                                placeholder="Enter city"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) =>
                                  handleInputChange("state", e.target.value)
                                }
                                placeholder="Enter state"
                              />
                            </div>
                            <div>
                              <Label htmlFor="zipCode">ZIP Code</Label>
                              <Input
                                id="zipCode"
                                value={formData.zipCode}
                                onChange={(e) =>
                                  handleInputChange("zipCode", e.target.value)
                                }
                                placeholder="Enter ZIP code"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid(currentStep)}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={createHealthProfessional.isPending}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        {createHealthProfessional.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Create Health Professional
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewHealthProfessional;
