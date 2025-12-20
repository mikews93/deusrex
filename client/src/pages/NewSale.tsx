import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SaleFormData {
  clientId: number;
  status: string;
  saleDate: string;
}

interface SaleItemFormData {
  type?: "product" | "service";
  productId?: number;
  serviceId?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const NewSale = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SaleFormData>({
    clientId: 0,
    status: "pending",
    saleDate: new Date().toISOString().split("T")[0] || "",
  });
  const [saleItems, setSaleItems] = useState<SaleItemFormData[]>([]);

  // Get clients for dropdown
  const { data: clients } = trpc.clients.getAll.useQuery();

  // Get products and services for dropdowns
  const { data: products } = trpc.products.getAll.useQuery();
  const { data: services } = trpc.services.getAll.useQuery();

  // Create sale mutation
  const createSale = trpc.sales.create.useMutation({
    onSuccess: (newSale) => {
      toast.success("Sale created successfully");
      navigate(`/sales/${newSale.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create sale");
    },
  });

  const handleInputChange = (
    field: keyof SaleFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (calculateTotal() <= 0) {
      toast.error("Please add at least one item with a valid total");
      return;
    }
    if (!formData.saleDate) {
      toast.error("Please select a sale date");
      return;
    }

    // Validate that at least one item is added
    if (saleItems.length === 0) {
      toast.error("Please add at least one item to the sale");
      return;
    }

    // Validate that all items have required fields
    const invalidItems = saleItems.filter(
      (item) =>
        (!item.productId && !item.serviceId) ||
        !item.quantity ||
        !item.unitPrice ||
        !item.totalPrice
    );

    if (invalidItems.length > 0) {
      toast.error("Please complete all item details before saving");
      return;
    }

    // Prepare sale items data
    const itemsData = saleItems.map((item) => ({
      productId: item.productId,
      serviceId: item.serviceId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      totalPrice: item.totalPrice.toString(),
    }));

    createSale.mutate({
      clientId: formData.clientId,
      totalAmount: calculateTotal().toString(),
      status: formData.status as "pending" | "completed" | "cancelled",
      saleDate: formData.saleDate,
      items: itemsData,
    });
  };

  const handleBack = () => {
    navigate("/sales");
  };

  const addSaleItem = () => {
    setSaleItems((prev) => [
      ...prev,
      {
        type: "product",
        productId: undefined,
        serviceId: undefined,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSaleItem = (
    index: number,
    field: keyof SaleItemFormData,
    value: string | number
  ) => {
    setSaleItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate total price if quantity and unit price are both set
          if (field === "quantity" || field === "unitPrice") {
            const quantity =
              field === "quantity" ? Number(value) : item.quantity;
            const unitPrice =
              field === "unitPrice" ? Number(value) : Number(item.unitPrice);
            if (quantity && unitPrice) {
              updatedItem.totalPrice = quantity * unitPrice;
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleItemTypeChange = (index: number, type: string) => {
    setSaleItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item };

          if (type === "product") {
            updatedItem.type = "product";
            updatedItem.productId = undefined;
            updatedItem.serviceId = undefined;
            updatedItem.unitPrice = 0;
            updatedItem.totalPrice = 0;
          } else if (type === "service") {
            updatedItem.type = "service";
            updatedItem.productId = undefined;
            updatedItem.serviceId = undefined;
            updatedItem.unitPrice = 0;
            updatedItem.totalPrice = 0;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleItemSelection = (
    index: number,
    itemId: number,
    type: "product" | "service"
  ) => {
    setSaleItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item };

          if (type === "product") {
            updatedItem.productId = itemId;
            updatedItem.serviceId = undefined;
            // Get product price
            const product = products?.find((p: any) => p.id === itemId);
            if (product) {
              updatedItem.unitPrice = Number(product.price) || 0;
              // Recalculate total price
              if (item.quantity && product.price) {
                updatedItem.totalPrice = item.quantity * Number(product.price);
              }
            }
          } else if (type === "service") {
            updatedItem.serviceId = itemId;
            updatedItem.productId = undefined;
            // Get service price
            const service = services?.find((s: any) => s.id === itemId);
            if (service) {
              updatedItem.unitPrice = Number(service.price) || 0;
              // Recalculate total price
              if (item.quantity && service.price) {
                updatedItem.totalPrice = item.quantity * Number(service.price);
              }
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => {
      return sum + (Number(item.totalPrice) || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    Create New Sale
                  </h1>
                  <p className="text-muted-foreground">
                    Add a new sale transaction
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={createSale.isPending}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Sale
                </Button>
              </div>
            </div>

            {/* Sale Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Sale Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientId">Client *</Label>
                      <Select
                        value={formData.clientId.toString()}
                        onValueChange={(value) =>
                          handleInputChange("clientId", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client: any) => (
                            <SelectItem
                              key={client.id}
                              value={client.id!.toString()}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="saleDate">Sale Date *</Label>
                      <Input
                        id="saleDate"
                        type="date"
                        value={formData.saleDate}
                        onChange={(e) =>
                          handleInputChange("saleDate", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalAmount">Total Amount *</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={calculateTotal().toFixed(2)}
                        readOnly
                        className="bg-muted"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sale Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sale Items *</CardTitle>
                    <Button size="sm" onClick={addSaleItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {saleItems.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price (Auto)</TableHead>
                            <TableHead>Total Price (Auto)</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {saleItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select
                                  value={item.type || ""}
                                  onValueChange={(value) =>
                                    handleItemTypeChange(index, value)
                                  }
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="product">
                                      Product
                                    </SelectItem>
                                    <SelectItem value="service">
                                      Service
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={
                                    item.productId?.toString() ||
                                    item.serviceId?.toString() ||
                                    ""
                                  }
                                  onValueChange={(value) => {
                                    if (item.type) {
                                      handleItemSelection(
                                        index,
                                        parseInt(value),
                                        item.type
                                      );
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {item.type === "product" &&
                                      products?.map((product: any) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id!.toString()}
                                        >
                                          {product.name} - $
                                          {Number(product.price).toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    {item.type === "service" &&
                                      services?.map((service: any) => (
                                        <SelectItem
                                          key={service.id}
                                          value={service.id!.toString()}
                                        >
                                          {service.name} - $
                                          {Number(service.price).toFixed(2)}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(
                                      e.target.value
                                    );
                                    updateSaleItem(
                                      index,
                                      "quantity",
                                      newQuantity
                                    );
                                    // Recalculate total price when quantity changes
                                    if (newQuantity && item.unitPrice) {
                                      const newTotal =
                                        newQuantity * item.unitPrice;
                                      updateSaleItem(
                                        index,
                                        "totalPrice",
                                        newTotal
                                      );
                                    }
                                  }}
                                  className="w-20"
                                  min="1"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice}
                                  readOnly
                                  className="w-24 bg-muted"
                                  placeholder="0.00"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.totalPrice}
                                  readOnly
                                  className="w-24 bg-muted"
                                  placeholder="0.00"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSaleItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Separator className="my-4" />

                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Items Total:
                          </p>
                          <p className="text-lg font-semibold">
                            ${calculateTotal().toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">No items added yet.</p>
                      <p className="text-sm">
                        At least one item is required to create a sale.
                      </p>
                      <p className="text-sm">
                        Click "Add Item" to get started.
                      </p>
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

export default NewSale;
