import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  Package,
  Clock,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CreateItemForm } from "@/components/forms/CreateItemForm";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";

const Items = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">(
    "all"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Get all items
  const {
    data: itemsData,
    isLoading,
    error,
  } = trpc.items.getAll.useQuery({
    search: searchTerm || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
  });

  // Handle both array and paginated responses
  const items = Array.isArray(itemsData) ? itemsData : itemsData?.data || [];

  const deleteItemMutation = trpc.items.delete.useMutation({
    onSuccess: () => {
      closeDeleteDialog();
      utils.items.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to delete item:", error);
    },
  });

  const utils = trpc.useUtils();

  const handleItemClick = (itemId: string) => {
    navigate(`/items/${itemId}`);
  };

  const handleEditItem = (itemId: string) => {
    navigate(`/items/${itemId}?edit=true`);
  };

  const handleCreateItem = () => {
    navigate("/items/new");
  };

  const openDeleteDialog = (item: { id: string; name: string }) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate({ id: itemToDelete.id });
    }
  };

  const getItemBadgeColor = (type: string) => {
    return type === "product"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const getItemIcon = (type: string) => {
    return type === "product" ? Package : Clock;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Items
                </h1>
                <p className="text-muted-foreground">
                  Manage products and services in your catalog
                </p>
              </div>
              <Button
                onClick={handleCreateItem}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value: any) => setTypeFilter(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Failed to load items</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!items || items.length === 0) && (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <Package className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first product or service to the
                  catalog.
                </p>
                <Button
                  onClick={handleCreateItem}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            )}

            {/* Items Grid */}
            {items && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const ItemIcon = getItemIcon(item.type);
                  return (
                    <Card
                      key={item.id}
                      className="hover:shadow-medium transition-shadow cursor-pointer"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ItemIcon className="h-5 w-5" />
                            {item.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getItemBadgeColor(item.type)}>
                              {item.type === "product" ? "Product" : "Service"}
                            </Badge>
                            <Badge
                              variant={item.isActive ? "default" : "secondary"}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item.id);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditItem(item.id);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteDialog({
                                      id: item.id,
                                      name: item.name,
                                    });
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">SKU</p>
                            <p
                              className="font-medium truncate"
                              title={item.sku || "N/A"}
                            >
                              {item.sku || "N/A"}
                            </p>
                          </div>
                          {item.type === "product" && (
                            <div>
                              <p className="text-muted-foreground">Stock</p>
                              <p className="font-medium">
                                {item.stock || 0} units
                              </p>
                            </div>
                          )}
                          {item.type === "service" && (
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">
                                {item.duration || 0} min
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Category</p>
                            <p
                              className="font-medium truncate"
                              title={item.category || "N/A"}
                            >
                              {item.category || "N/A"}
                            </p>
                          </div>
                        </div>
                        {item.description && (
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Description
                            </p>
                            <p
                              className="font-medium truncate"
                              title={item.description}
                            >
                              {item.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        entityName="item"
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
};

export default Items;
