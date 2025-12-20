import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VitalSign {
  label: string;
  value: string;
  status: "normal" | "warning" | "critical";
  icon: React.ElementType;
}

interface PatientCardProps {
  name: string;
  age: number;
  condition: string;
  room: string;
  avatar?: string;
  vitals: VitalSign[];
  lastUpdated: string;
}

export function PatientCard({
  name,
  age,
  condition,
  room,
  avatar,
  vitals,
  lastUpdated,
}: PatientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-success";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-success/10";
      case "warning":
        return "bg-warning/10";
      case "critical":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="bg-gradient-card hover:shadow-medium transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Age {age} • Room {room}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="secondary" className="text-xs">
            {condition}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {vitals.map((vital, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${getStatusBg(
                vital.status
              )} transition-colors`}
            >
              <div className="flex items-center justify-between mb-1">
                <vital.icon
                  className={`h-4 w-4 ${getStatusColor(vital.status)}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">{vital.label}</p>
              <p
                className={`text-sm font-semibold ${getStatusColor(
                  vital.status
                )}`}
              >
                {vital.value}
              </p>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}
