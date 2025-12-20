import { Users, Calendar, Activity, Heart, Clock } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PatientCard } from "@/components/dashboard/PatientCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AppointmentsPanel } from "@/components/dashboard/AppointmentsPanel";

const patients = [
  {
    name: "John Smith",
    age: 65,
    condition: "Hypertension",
    room: "301",
    vitals: [
      {
        label: "Heart Rate",
        value: "78 bpm",
        status: "normal" as const,
        icon: Heart,
      },
      {
        label: "Blood Pressure",
        value: "130/85",
        status: "warning" as const,
        icon: Activity,
      },
      {
        label: "Temperature",
        value: "98.6°F",
        status: "normal" as const,
        icon: Activity,
      },
    ],
    lastUpdated: "5 minutes ago",
  },
  {
    name: "Emily Davis",
    age: 32,
    condition: "Post-Surgery",
    room: "205",
    vitals: [
      {
        label: "Heart Rate",
        value: "85 bpm",
        status: "normal" as const,
        icon: Heart,
      },
      {
        label: "Blood Pressure",
        value: "120/80",
        status: "normal" as const,
        icon: Activity,
      },
      {
        label: "Temperature",
        value: "99.1°F",
        status: "warning" as const,
        icon: Activity,
      },
    ],
    lastUpdated: "12 minutes ago",
  },
  {
    name: "Michael Johnson",
    age: 58,
    condition: "Diabetes",
    room: "147",
    vitals: [
      {
        label: "Heart Rate",
        value: "92 bpm",
        status: "warning" as const,
        icon: Heart,
      },
      {
        label: "Blood Pressure",
        value: "140/90",
        status: "critical" as const,
        icon: Activity,
      },
      {
        label: "Temperature",
        value: "98.4°F",
        status: "normal" as const,
        icon: Activity,
      },
    ],
    lastUpdated: "8 minutes ago",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="Total Patients"
                value="142"
                change="+12% from last month"
                changeType="positive"
                icon={Users}
                gradient
              />
              <StatsCard
                title="Today's Appointments"
                value="28"
                change="+5 from yesterday"
                changeType="positive"
                icon={Calendar}
              />
              <StatsCard
                title="Critical Alerts"
                value="3"
                change="2 resolved today"
                changeType="neutral"
                icon={Activity}
              />
              <StatsCard
                title="Avg Response Time"
                value="4.2 min"
                change="-15% improvement"
                changeType="positive"
                icon={Clock}
              />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Monitoring */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Patient Monitoring
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {patients.map((patient, index) => (
                      <PatientCard
                        key={index}
                        name={patient.name}
                        age={patient.age}
                        condition={patient.condition}
                        room={patient.room}
                        vitals={patient.vitals}
                        lastUpdated={patient.lastUpdated}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <AppointmentsPanel />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
