import { Calendar, FileText, Heart, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const activities = [
  {
    id: 1,
    type: "appointment",
    title: "Cardiology consultation",
    patient: "John Smith",
    time: "2 hours ago",
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    type: "vital",
    title: "Vital signs updated",
    patient: "Emily Davis",
    time: "3 hours ago",
    icon: Heart,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: 3,
    type: "record",
    title: "Medical record added",
    patient: "Michael Johnson",
    time: "4 hours ago",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: 4,
    type: "patient",
    title: "New patient registered",
    patient: "Sarah Wilson",
    time: "5 hours ago",
    icon: UserPlus,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function RecentActivity() {
  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className={`rounded-lg p-2 ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.patient}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">{activity.time}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
