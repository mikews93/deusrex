import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@/components/auth/UserButton";
import { OrganizationSwitcher } from "@/components/auth/OrganizationSwitcher";

export function Header() {
  const { user } = useUser();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur-md px-4 shadow-soft sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="lg:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center gap-x-2">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
            <Input
              className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              placeholder="Search patients, appointments..."
              type="search"
            />
          </div>
          <div className="flex-shrink-0">
            <OrganizationSwitcher />
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>

          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-border"
            aria-hidden="true"
          />

          <div className="flex items-center gap-x-3">
            <div className="hidden lg:flex lg:flex-col lg:items-end lg:leading-tight">
              <span className="text-sm font-medium text-foreground">
                {user?.fullName ||
                  user?.emailAddresses[0]?.emailAddress ||
                  "User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  );
}
