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
  Building,
  Calendar,
  FileText,
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

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

const ClientProfile = () => {
  const { client_id } = useParams<{ client_id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });

  const {
    data: client,
    isLoading,
    refetch,
  } = trpc.clients.getById.useQuery(
    { id: client_id || "" },
    { enabled: !!client_id }
  );

  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully");
      setIsEditing(false);
      navigate(`/clients/${client_id}`, { replace: true });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update client");
    },
  });

  const { data: salesData } = trpc.sales.getAll.useQuery({
    clientId: client_id!,
    with: JSON.stringify({ saleItems: true }),
  });

  const sales = Array.isArray(salesData) ? salesData : salesData?.data || [];

  useEffect(() => {
    const editMode = searchParams.get("edit") === "true";
    setIsEditing(editMode);
  }, [searchParams]);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
      });
    }
  }, [client]);

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!client_id) return;

    updateClient.mutate({
      id: client_id,
      ...formData,
    });
  };

  const handleCancel = () => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
      });
    }
    setIsEditing(false);
    navigate(`/clients/${client_id}`, { replace: true });
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

  if (!client) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground mb-4">
                  Client not found
                </h1>
                <Button onClick={() => navigate("/clients")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Clients
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/clients")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Clients
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {client.name || "Unnamed Client"}
                  </h1>
                  <p className="text-muted-foreground">
                    {client.company || "Individual Client"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={updateClient.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateClient.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateClient.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      navigate(`/clients/${client_id}?edit=true`, {
                        replace: true,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Enter client name"
                          />
                        ) : (
                          <p className="text-sm text-foreground">
                            {client.name || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        {isEditing ? (
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) =>
                              handleInputChange("company", e.target.value)
                            }
                            placeholder="Enter company name"
                          />
                        ) : (
                          <p className="text-sm text-foreground">
                            {client.company || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="Enter email address"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-foreground">
                              {client.email || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-foreground">
                              {client.phone || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      {isEditing ? (
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          placeholder="Enter full address"
                          rows={3}
                        />
                      ) : (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-foreground">
                            {client.address || "Not provided"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={client.isActive ? "default" : "secondary"}
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>
                        Created:{" "}
                        {new Date(client.createdAt || "").toLocaleDateString()}
                      </p>
                      <p>
                        Last Updated:{" "}
                        {new Date(client.updatedAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Sales Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Sales:
                        </span>
                        <span className="text-sm font-medium">
                          {sales.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Revenue:
                        </span>
                        <span className="text-sm font-medium">
                          $
                          {sales
                            .reduce(
                              (sum, sale) =>
                                sum +
                                (parseFloat(sale.totalAmount || "0") || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sales History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No sales found
                      </h3>
                      <p className="text-muted-foreground">
                        This client hasn't made any purchases yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  sale.createdAt || ""
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">Sale #{sale.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {sale.saleItems?.length || 0} items
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${sale.totalAmount}</p>
                            <Badge
                              variant={
                                sale.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {sale.status}
                            </Badge>
                          </div>
                        </div>
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

export default ClientProfile;
