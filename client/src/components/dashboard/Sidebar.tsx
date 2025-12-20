import {
  Activity,
  Calendar,
  Home,
  Settings,
  Users,
  Building2,
  Package,
  ShoppingCart,
  UserCheck,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "react-router-dom";

const navigation = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Patients", icon: Users, href: "/patients" },
  {
    name: "Health Professionals",
    icon: Stethoscope,
    href: "/health-professionals",
  },
  { name: "Appointments", icon: Calendar, href: "/appointments" },
  { name: "Clients", icon: UserCheck, href: "/clients" },
  { name: "Items", icon: Package, href: "/items" },
  { name: "Sales", icon: ShoppingCart, href: "/sales" },
  { name: "Organizations", icon: Building2, href: "/organizations" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4 shadow-soft">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                HealthCare
              </h1>
              <p className="text-sm text-muted-foreground">Medical Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          isActive
                            ? "bg-gradient-primary text-primary-foreground shadow-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-all duration-200"
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground",
                            "h-5 w-5 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <Link
                to="/settings"
                className={cn(
                  location.pathname === "/settings"
                    ? "bg-gradient-primary text-primary-foreground shadow-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  "group -mx-2 flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-all duration-200"
                )}
              >
                <Settings
                  className={cn(
                    location.pathname === "/settings"
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                    "h-5 w-5 shrink-0"
                  )}
                  aria-hidden="true"
                />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
