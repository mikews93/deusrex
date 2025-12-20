import {
  useOrganization,
  useOrganizationList,
  useClerk,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Plus, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function OrganizationSwitcher() {
  /**
   * Hooks
   */
  const { organization: activeOrganization } = useOrganization();
  const { setActive } = useOrganizationList();
  const { openCreateOrganization } = useClerk();

  /**
   * Queries
   */
  const { data: organizations, isLoading } =
    trpc.organizations.getAll.useQuery();

  /**
   * Handlers
   */
  const handleCreateOrganization = () => {
    openCreateOrganization();
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="h-9 px-3" disabled>
        <Building2 className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-block">Loading...</span>
        <span className="sm:hidden">...</span>
      </Button>
    );
  }

  // If we have an active organization but no memberships data, show the active org
  if (organizations && (!organizations || organizations.length === 0)) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline-block font-semibold text-sm">
          {activeOrganization?.name || "Unknown"}
        </span>
        <span className="sm:hidden font-semibold text-sm">Org</span>
      </div>
    );
  }

  // If no memberships after loading, show a disabled state
  if (!organizations?.length) {
    return (
      <Button variant="outline" size="sm" className="h-9 px-3" disabled>
        <Building2 className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-block">No Organizations</span>
        <span className="sm:hidden">No Orgs</span>
      </Button>
    );
  }

  // If only one organization, show just the name without dropdown
  if (organizations.length === 1) {
    const singleOrg = organizations[0];
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline-block font-semibold text-sm">
          {singleOrg.name}
        </span>
        <span className="sm:hidden font-semibold text-sm">Org</span>
      </div>
    );
  }

  // Multiple organizations - show dropdown switcher
  const handleSwitch = async (organizationId: string) => {
    await setActive?.({ organization: organizationId });
    // Reload the page after organization switch to ensure all data is refreshed
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3">
          <Building2 className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline-block max-w-32 truncate">
            {activeOrganization?.name || "Select Org"}
          </span>
          <span className="sm:hidden">Org</span>
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Organizations</p>
            <p className="text-xs leading-none text-muted-foreground">
              Switch between organizations
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations
          .filter(
            (org) => org.clerkOrgId && org.clerkOrgId !== activeOrganization?.id
          )
          .map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.clerkOrgId!)}
              className="cursor-pointer"
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCreateOrganization}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
