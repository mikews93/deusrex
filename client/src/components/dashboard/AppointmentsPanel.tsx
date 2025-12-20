import { Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const appointments = [
  {
    id: 1,
    patient: "Robert Chen",
    time: "09:00 AM",
    type: "Routine Checkup",
    room: "Room 201",
    status: "confirmed"
  },
  {
    id: 2,
    patient: "Lisa Anderson",
    time: "10:30 AM",
    type: "Cardiology",
    room: "Room 305",
    status: "pending"
  },
  {
    id: 3,
    patient: "David Miller",
    time: "02:00 PM",
    type: "Follow-up",
    room: "Room 102",
    status: "confirmed"
  },
  {
    id: 4,
    patient: "Maria Garcia",
    time: "03:30 PM",
    type: "Emergency",
    room: "ER-1",
    status: "urgent"
  }
];

export function AppointmentsPanel() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-soft transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {appointment.patient}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{appointment.time}</span>
                  <span>•</span>
                  <span>{appointment.type}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{appointment.room}</span>
                </div>
              </div>
            </div>
            <Badge variant={getStatusVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}