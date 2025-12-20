import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";

const SaleProfile = () => {
  const { sale_id } = useParams<{ sale_id: string }>();
  const navigate = useNavigate();

  // Get sale data
  const {
    data: sale,
    isLoading,
    error,
  } = trpc.sales.getById.useQuery(
    {
      id: sale_id!,
      with: JSON.stringify({
        client: true,
        saleItems: {
          with: {
            item: true,
          },
        },
      }),
    },
    { enabled: !!sale_id }
  );

  const handleBack = () => {
    navigate("/sales");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Sale not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  The sale you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sales
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
                    Sale #{sale.id}
                  </h1>
                  <p className="text-muted-foreground">View sale details</p>
                </div>
              </div>
            </div>

            {/* Sale Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Sale Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Client
                      </p>
                      <p className="text-sm text-foreground">
                        {sale.client?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Sale Date
                      </p>
                      <p className="text-sm text-foreground">
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-sm text-foreground">
                        ${Number(sale.totalAmount).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant={
                          sale.status === "completed"
                            ? "default"
                            : sale.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {sale.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sale Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Sale Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {sale.saleItems && sale.saleItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.saleItems.map((item, index) => {
                          const itemType =
                            item.item?.type === "product"
                              ? "Product"
                              : "Service";
                          const itemName = item.item?.name || "N/A";

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.item?.type === "product"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {itemType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-medium">
                                    {itemName}
                                  </span>
                                  {item.item?.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.item.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span>{item.quantity}</span>
                              </TableCell>
                              <TableCell>
                                <span>
                                  ${Number(item.unitPrice).toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span>
                                  ${Number(item.totalPrice).toFixed(2)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No items in this sale
                    </div>
                  )}

                  {/* Sale Items Summary */}
                  {sale.saleItems && sale.saleItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex gap-4">
                          <span className="text-muted-foreground">
                            Total Items:{" "}
                            <span className="font-medium">
                              {sale.saleItems.length}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Products:{" "}
                            <span className="font-medium">
                              {
                                sale.saleItems.filter(
                                  (item) => item.item?.type === "product"
                                ).length
                              }
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            Services:{" "}
                            <span className="font-medium">
                              {
                                sale.saleItems.filter(
                                  (item) => item.item?.type === "service"
                                ).length
                              }
                            </span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">
                            Total Amount:
                          </span>
                          <span className="font-bold text-lg ml-2">
                            ${Number(sale.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">
                        {sale.updatedAt
                          ? new Date(sale.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
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

export default SaleProfile;
