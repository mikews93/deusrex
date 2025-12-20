import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProviderWrapper } from "./providers/ClerkProvider";
import { TrpcProvider } from "./providers/TrpcProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { OrganizationCheck } from "./components/auth/OrganizationCheck";
import { SignInPage } from "./components/auth/SignIn";
import { SignUpPage } from "./components/auth/SignUp";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import NewPatient from "./pages/NewPatient";
import SaleProfile from "./pages/SaleProfile";
import NewSale from "./pages/NewSale";
import Appointments from "./pages/Appointments";
import HealthProfessionals from "./pages/HealthProfessionals";
import HealthProfessionalProfile from "./pages/HealthProfessionalProfile";
import NewHealthProfessional from "./pages/NewHealthProfessional";

import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Items from "./pages/Items";
import ItemProfile from "./pages/ItemProfile";
import Sales from "./pages/Sales";
import Organizations from "./pages/Organizations";
import Settings from "./pages/Settings";

const App = () => (
  <ClerkProviderWrapper>
    <TrpcProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Index />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Patients />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <NewPatient />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:patient_id"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <PatientProfile />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-professionals"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <HealthProfessionals />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-professionals/new"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <NewHealthProfessional />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-professionals/:health_professional_id"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <HealthProfessionalProfile />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Appointments />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Clients />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:client_id"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <ClientProfile />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Items />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/:id"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <ItemProfile />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales/new"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <NewSale />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales/:sale_id"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <SaleProfile />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Sales />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Organizations />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <OrganizationCheck>
                    <Settings />
                  </OrganizationCheck>
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TrpcProvider>
  </ClerkProviderWrapper>
);

export default App;
