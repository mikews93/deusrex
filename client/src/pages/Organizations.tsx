import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useClerk } from "@clerk/clerk-react";

const Organizations = () => {
  /**
   * Hooks
   */
  const { openCreateOrganization, openOrganizationProfile } = useClerk();

  /**
   * Queries
   */
  const {
    data: organizations,
    isLoading,
    error,
  } = trpc.organizations.getAll.useQuery();

  /**
   * Handlers
   */
  const handleCreateOrganization = () => {
    openCreateOrganization();
  };

  const handleViewDetails = (_orgId: string) => {
    // Open Clerk's organization profile for viewing details
    openOrganizationProfile();
  };

  const handleEditOrganization = (_orgId: string) => {
    // Open Clerk's organization profile for editing
    openOrganizationProfile();
  };

  const handleManageMembers = (_orgId: string) => {
    // Open Clerk's organization members management
    openOrganizationProfile();
  };

  const handleViewSettings = (_orgId: string) => {
    // Open Clerk's organization settings
    openOrganizationProfile();
  };

  const handleDeleteOrganization = (_orgId: string) => {
    // This would typically open a confirmation dialog first
    // For now, we'll open the organization profile where deletion can be managed
    openOrganizationProfile();
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
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Organizations
                  </h1>
                  <p className="text-muted-foreground">
                    Manage healthcare organizations and their settings
                  </p>
                </div>
                <Button
                  onClick={handleCreateOrganization}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Organization
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{organizations?.length || 0} organizations</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Failed to load organizations</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading &&
              !error &&
              (!organizations || organizations.length === 0) && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-12 h-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No organizations found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first healthcare organization.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Organization
                  </Button>
                </div>
              )}

            {/* Organizations Table */}
            {organizations && organizations.length > 0 && (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Logo</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell>{org.description || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={org.isActive ? "default" : "secondary"}
                          >
                            {org.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {org.slug || "N/A"}
                        </TableCell>
                        <TableCell>
                          {org.logoUrl ? (
                            <a
                              href={org.logoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Logo
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewDetails(org.clerkOrgId || "")
                                }
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditOrganization(org.clerkOrgId || "")
                                }
                              >
                                Edit Organization
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleManageMembers(org.clerkOrgId || "")
                                }
                              >
                                Manage Members
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewSettings(org.clerkOrgId || "")
                                }
                              >
                                View Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleDeleteOrganization(org.clerkOrgId || "")
                                }
                              >
                                Delete Organization
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Organizations;
