import { router } from '@/modules/trpc/trpc';
import { authRouter } from '@/modules/auth/auth.router';
import { patientsRouter } from '@/modules/patients/patients.router';
import { clientsRouter } from '@/modules/clients/clients.router';
import { itemsRouter } from '@/modules/items/items.router';
import { salesRouter } from '@/modules/sales/sales.router';
import { organizationsRouter } from '@/modules/organizations/organizations.router';
import { appointmentsRouter } from '@/modules/appointments/appointments.router';
import { medicalRecordsRouter } from '@/modules/medical-records/medical-records.router';
import { usersRouter } from '@/modules/users/users.router';
import { healthProfessionalsRouter } from '@/modules/health-professionals/health-professionals.router';

export const appRouter = router({
  auth: authRouter,
  patients: patientsRouter,
  clients: clientsRouter,
  items: itemsRouter,
  sales: salesRouter,
  organizations: organizationsRouter,
  appointments: appointmentsRouter,
  'medical-records': medicalRecordsRouter,
  users: usersRouter,
  'health-professionals': healthProfessionalsRouter,
});

export type AppRouter = typeof appRouter;
