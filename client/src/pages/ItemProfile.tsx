import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Trash2,
  Package,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import { toast } from "sonner";

interface ItemFormData {
  name: string;
  description: string;
  sku: string;
  price: string;
  cost: string;
  type: "product" | "service";
  stock: string;
  duration: string;
  category: string;
  isActive: boolean;
}

const ItemProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    description: "",
    sku: "",
    price: "",
    cost: "",
    type: "product",
    stock: "",
    duration: "",
    category: "",
    isActive: true,
  });

  const isNewItem = id === "new";

  const {
    data: item,
    isLoading,
    error,
  } = trpc.items.getById.useQuery(
    {
      id: id!,
    },
    { enabled: !isNewItem }
  );

  const { data: salesData = [] } = trpc.sales.getByItem.useQuery(
    {
      itemId: id!,
    },
    { enabled: !isNewItem }
  );

  // Create mutation
  const createItem = trpc.items.create.useMutation({
    onSuccess: (newItem) => {
      toast.success("Item created successfully");
      navigate(`/items/${newItem.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create item");
    },
  });

  // Update mutation
  const updateItem = trpc.items.update.useMutation({
    onSuccess: () => {
      toast.success("Item updated successfully");
      setIsEditing(false);
      // Update URL to remove edit parameter after successful save
      navigate(`/items/${id}`, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update item");
    },
  });

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      navigate("/items");
    },
    onError: (error) => {
      console.error("Failed to delete item:", error);
    },
  });

  // Check for edit mode from URL parameters or if it's a new item
  useEffect(() => {
    const editMode = searchParams.get("edit") === "true";
    setIsEditing(editMode || isNewItem);
  }, [searchParams, isNewItem]);

  // Load item data into form when data is fetched
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        sku: item.sku || "",
        price: item.price || "",
        cost: item.cost || "",
        type: item.type || "product",
        stock: item.stock?.toString() || "",
        duration: item.duration?.toString() || "",
        category: item.category || "",
        isActive: item.isActive ?? true,
      });
    }
  }, [item]);

  const handleInputChange = (
    field: keyof ItemFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isNewItem) {
      // Create new item
      createItem.mutate({
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: formData.price,
        cost: formData.cost,
        type: formData.type,
        stock:
          formData.type === "product"
            ? parseInt(formData.stock) || 0
            : undefined,
        duration:
          formData.type === "service"
            ? parseInt(formData.duration) || undefined
            : undefined,
        category: formData.category,
        isActive: formData.isActive,
        organizationId: "", // This will be set by the backend
      });
    } else {
      // Update existing item
      updateItem.mutate({
        id: id!,
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: formData.price,
        cost: formData.cost,
        type: formData.type,
        stock:
          formData.type === "product"
            ? parseInt(formData.stock) || 0
            : undefined,
        duration:
          formData.type === "service"
            ? parseInt(formData.duration) || undefined
            : undefined,
        category: formData.category,
        isActive: formData.isActive,
      });
    }
  };

  const handleCancel = () => {
    if (isNewItem) {
      // Navigate back to items list for new items
      navigate("/items");
    } else {
      setIsEditing(false);
      // Reset form data to original item data
      if (item) {
        setFormData({
          name: item.name || "",
          description: item.description || "",
          sku: item.sku || "",
          price: item.price || "",
          cost: item.cost || "",
          type: item.type || "product",
          stock: item.stock?.toString() || "",
          duration: item.duration?.toString() || "",
          category: item.category || "",
          isActive: item.isActive ?? true,
        });
      }
      navigate(`/items/${id}`, { replace: true });
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteItemMutation.mutate({ id });
    }
  };

  const getItemIcon = (type: string) => {
    return type === "product" ? (
      <Package className="h-5 w-5" />
    ) : (
      <Clock className="h-5 w-5" />
    );
  };

  const getItemBadgeColor = (type: string) => {
    return type === "product"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  if (isLoading && !isNewItem) {
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

  if ((error || !item) && !isNewItem) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Item not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error?.message ||
                    "The item you're looking for doesn't exist or has been removed."}
                </p>
                <Button onClick={() => navigate("/items")}>
                  Back to Items
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const sales = salesData;
  const totalRevenue = sales
    .reduce((sum, sale) => {
      const itemSales =
        sale.saleItems?.filter((saleItem) => saleItem.itemId === item.id) || [];
      return (
        sum +
        itemSales.reduce(
          (itemSum, saleItem) => itemSum + Number(saleItem.totalPrice || 0),
          0
        )
      );
    }, 0)
    .toFixed(2);

  const totalQuantitySold = sales.reduce((sum, sale) => {
    const itemSales =
      sale.saleItems?.filter((saleItem) => saleItem.itemId === item.id) || [];
    return (
      sum +
      itemSales.reduce(
        (itemSum, saleItem) => itemSum + (saleItem.quantity || 0),
        0
      )
    );
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/items")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  {getItemIcon(isNewItem ? formData.type : item?.type)}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isNewItem ? "Create New Item" : item?.name}
                    </h1>
                    {!isNewItem && (
                      <div className="flex items-center gap-2">
                        <Badge className={getItemBadgeColor(item?.type)}>
                          {item?.type}
                        </Badge>
                        {item?.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={
                        isNewItem ? createItem.isPending : updateItem.isPending
                      }
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isNewItem
                        ? createItem.isPending
                          ? "Creating..."
                          : "Create Item"
                        : updateItem.isPending
                        ? "Saving..."
                        : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={
                        isNewItem ? createItem.isPending : updateItem.isPending
                      }
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/items/${item?.id}?edit=true`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {!isNewItem && (
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              placeholder="Enter item name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) =>
                                handleInputChange("sku", e.target.value)
                              }
                              placeholder="Enter SKU"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            placeholder="Enter item description"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price *</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) =>
                                handleInputChange("price", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cost">Cost</Label>
                            <Input
                              id="cost"
                              type="number"
                              step="0.01"
                              value={formData.cost}
                              onChange={(e) =>
                                handleInputChange("cost", e.target.value)
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(value: "product" | "service") =>
                                handleInputChange("type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={formData.category}
                              onChange={(e) =>
                                handleInputChange("category", e.target.value)
                              }
                              placeholder="Enter category"
                            />
                          </div>
                        </div>
                        {formData.type === "product" && (
                          <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                handleInputChange("stock", e.target.value)
                              }
                              placeholder="0"
                            />
                          </div>
                        )}
                        {formData.type === "service" && (
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) =>
                                handleInputChange("duration", e.target.value)
                              }
                              placeholder="0"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Name
                            </label>
                            <p className="text-sm">{item?.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              SKU
                            </label>
                            <p className="text-sm">{item?.sku || "N/A"}</p>
                          </div>
                        </div>
                        {item?.description && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Description
                            </label>
                            <p className="text-sm mt-1">{item?.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Price
                            </label>
                            <p className="text-sm font-semibold">
                              ${item?.price}
                            </p>
                          </div>
                          {item?.cost && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Cost
                              </label>
                              <p className="text-sm">${item?.cost}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Type-specific Information */}
                {!isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {item?.type === "product"
                          ? "Product Details"
                          : "Service Details"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {item?.type === "product" && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Stock Quantity
                          </label>
                          <p className="text-sm font-semibold">
                            {item?.stock || 0}
                          </p>
                        </div>
                      )}
                      {item?.type === "service" && item?.duration && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Duration
                          </label>
                          <p className="text-sm font-semibold">
                            {item?.duration} minutes
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Sales History */}
                {!isNewItem && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sales.length > 0 ? (
                        <div className="space-y-4">
                          {sales.slice(0, 5).map((sale) => (
                            <div
                              key={sale.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Sale #{sale.id.slice(-8)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      sale.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">
                                  $
                                  {sale.saleItems
                                    ?.filter(
                                      (saleItem) => saleItem.itemId === item?.id
                                    )
                                    .reduce(
                                      (sum, saleItem) =>
                                        sum + Number(saleItem.totalPrice || 0),
                                      0
                                    )
                                    .toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty:{" "}
                                  {sale.saleItems
                                    ?.filter(
                                      (saleItem) => saleItem.itemId === item?.id
                                    )
                                    .reduce(
                                      (sum, saleItem) =>
                                        sum + (saleItem.quantity || 0),
                                      0
                                    )}
                                </p>
                              </div>
                            </div>
                          ))}
                          {sales.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              And {sales.length - 5} more sales...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No sales recorded for this item.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Revenue
                      </span>
                      <span className="text-lg font-semibold text-green-600">
                        ${totalRevenue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Sold</span>
                      <span className="text-lg font-semibold">
                        {totalQuantitySold}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unit Price</span>
                      <span className="text-lg font-semibold">
                        ${item?.price}
                      </span>
                    </div>
                    {item?.cost && <Separator />}
                    {item?.cost && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Profit per Unit
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          $
                          {(Number(item?.price) - Number(item?.cost)).toFixed(
                            2
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Item Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge
                          variant={item?.isActive ? "default" : "secondary"}
                        >
                          {item?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm">
                          {item?.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Updated</span>
                        <span className="text-sm">
                          {item?.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${item?.name}"? This action cannot be undone.`}
        entityName="item"
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
};

export default ItemProfile;
