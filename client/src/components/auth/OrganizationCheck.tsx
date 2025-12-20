import {
  useOrganization,
  useOrganizationList,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface OrganizationCheckProps {
  children: React.ReactNode;
}

export function OrganizationCheck({ children }: OrganizationCheckProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const { signOut } = useClerk();
  const [isChecking, setIsChecking] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const checkOrganization = async () => {
      if (!isLoaded || !user) {
        return;
      }

      setIsChecking(true);

      try {
        // Check if user has an active organization
        if (organization) {
          setHasOrganization(true);
          setIsChecking(false);
          return;
        }

        // Check if user has any organization memberships
        if (userMemberships?.data && userMemberships.data.length > 0) {
          // Check if user has a preferred active organization in metadata
          const activeOrgId = user.publicMetadata
            ?.activeOrganizationId as string;

          if (activeOrgId) {
            // Find the organization with the active ID
            const preferredOrg = userMemberships.data.find(
              (membership) => membership.organization.id === activeOrgId
            );

            if (preferredOrg) {
              await setActive({ organization: preferredOrg.organization });
              console.log(
                `✅ Set active organization: ${preferredOrg.organization.name}`
              );
            } else {
              // Fallback to first organization if preferred not found
              const firstOrganization = userMemberships.data[0]?.organization;
              if (firstOrganization) {
                await setActive({ organization: firstOrganization });
                console.log(
                  `⚠️  Preferred organization not found, using first: ${firstOrganization.name}`
                );
              }
            }
          } else {
            // No preferred organization, use the first one
            const firstOrganization = userMemberships.data[0]?.organization;
            if (firstOrganization) {
              await setActive({ organization: firstOrganization });
              console.log(
                `ℹ️  No preferred organization, using first: ${firstOrganization.name}`
              );
            }
          }

          setHasOrganization(true);
        } else {
          setHasOrganization(false);
          setIsSigningOut(true);

          // Automatically sign out the user
          try {
            await signOut();
          } catch (error) {
            console.error("❌ Error signing out user:", error);
            setIsSigningOut(false);
          }
        }
      } catch (error) {
        console.error("❌ Error checking organization:", error);
        setHasOrganization(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkOrganization();
  }, [user, organization, userMemberships, isLoaded, setActive, signOut]);

  // Show loading state
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking Organization Access
            </CardTitle>
            <CardDescription>
              Verifying your organization permissions...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show brief message if user has no organizations (will be signed out automatically)
  if (!hasOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {isSigningOut ? "Signing Out" : "No Organization Access"}
            </CardTitle>
            <CardDescription>
              {isSigningOut
                ? "You don't have access to any organizations."
                : "You don't have access to any organizations."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {isSigningOut
                ? "Signing you out automatically..."
                : "You will be signed out automatically."}
            </div>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success and render children
  return <>{children}</>;
}
