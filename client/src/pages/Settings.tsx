import { useUser, useOrganization } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Shield, Bell, Palette } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function Settings() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account and organization settings
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* User Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      User Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your personal account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {user?.fullName || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {(user?.publicMetadata?.role as string) || "User"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Security Settings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notification Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your organization settings and team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {organization?.name || "No Organization"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {organization?.membersCount || 0} members
                        </p>
                      </div>
                      <Badge variant="outline">
                        {(organization?.publicMetadata?.plan as string) ||
                          "Free"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Organization Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Manage Members
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Organization Security
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Application Settings
                    </CardTitle>
                    <CardDescription>
                      Customize your application experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Palette className="mr-2 h-4 w-4" />
                        Theme Settings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Application Notifications
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common actions and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Switch Organization
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Invite Team Member
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        View Activity Log
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
