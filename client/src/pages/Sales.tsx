import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  ShoppingCart,
  Search,
  Plus,
  MoreHorizontal,
  DollarSign,
  Clock,
  TrendingUp,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";

const Sales = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Get sales stats
  const { data: stats, isLoading: statsLoading } =
    trpc.sales.getStats.useQuery();

  // Get sales with search and filters
  const {
    data: salesData,
    isLoading,
    error,
  } = trpc.sales.getAll.useQuery({
    search: debouncedSearchQuery || undefined,
    status:
      statusFilter && statusFilter !== "all"
        ? (statusFilter as "pending" | "completed" | "cancelled")
        : undefined,
    with: JSON.stringify({ client: true }),
  });

  // Handle both array and paginated responses
  const sales = Array.isArray(salesData) ? salesData : salesData?.data || [];

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setDebouncedSearchQuery(searchValue);
    }, 500),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("all");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleViewSale = (saleId: number) => {
    navigate(`/sales/${saleId}`);
  };

  const handleEditSale = (saleId: number) => {
    navigate(`/sales/${saleId}/edit`);
  };

  const handleDeleteSale = (saleId: number, saleName: string) => {
    setSaleToDelete({ id: saleId, name: saleName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      // TODO: Implement sales delete functionality
      console.log("Delete sale:", saleToDelete.id);
      closeDeleteDialog();
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleCreateSale = () => {
    navigate("/sales/new");
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  if (isLoading || statsLoading) {
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
                  Sales
                </h1>
                <p className="text-muted-foreground">
                  Track and manage sales transactions
                </p>
              </div>
              <Button
                onClick={handleCreateSale}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalSales || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Sales
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.pendingSales || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalTransactions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats?.totalAmount?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart showing sales based on filters will be implemented here
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || (statusFilter && statusFilter !== "all")) && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                {searchQuery || (statusFilter && statusFilter !== "all")
                  ? `${sales.length} results for "${
                      searchQuery || statusFilter
                    }"`
                  : `${sales.length} sales`}
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Failed to load sales</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Sales Table */}
            {sales.length > 0 ? (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewSale(sale.id!)}
                      >
                        <TableCell className="font-medium">
                          #{sale.id}
                        </TableCell>
                        <TableCell>{sale.client?.name || "N/A"}</TableCell>
                        <TableCell>
                          {sale.saleDate
                            ? new Date(sale.saleDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(sale.totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {sale.createdAt
                            ? new Date(sale.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                              sideOffset={5}
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSale(sale.id!);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSale(sale.id!);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Sale</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSale(
                                    sale.id!,
                                    `Sale #${sale.id}`
                                  );
                                }}
                                className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Sale</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <ShoppingCart className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery || (statusFilter && statusFilter !== "all")
                    ? "No sales found"
                    : "No sales found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || (statusFilter && statusFilter !== "all")
                    ? `No sales match your search for "${
                        searchQuery || statusFilter
                      }". Try adjusting your search terms.`
                    : "Get started by creating your first sale transaction."}
                </p>
                {!searchQuery && !(statusFilter && statusFilter !== "all") && (
                  <Button
                    onClick={handleCreateSale}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sale
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Sale"
        description={`Are you sure you want to delete ${saleToDelete?.name}? This action cannot be undone.`}
        entityName="Sale"
        isLoading={false}
      />
    </div>
  );
};

export default Sales;
