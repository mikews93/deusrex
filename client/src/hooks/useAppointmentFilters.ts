import { useSearchParams } from "./useSearchParams";
import { AppointmentFilters } from "@/components/forms/AppointmentFilters";

/**
 * Custom hook for managing appointment filters with search parameters
 * Provides type-safe access to appointment-specific filters
 */
export function useAppointmentFilters(withRelations?: Record<string, any>) {
  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  const config = {
    defaults: {
      paginated: false,
      sortBy: "appointmentDate" as const,
      sortOrder: "asc" as const,
      appointmentDateFrom: startOfDay.toISOString(),
      appointmentDateTo: endOfDay.toISOString(),
    },
    excludeFromUrl: ["paginated", "page", "limit"],
    parsers: {
      patientId: (value: string) => (value ? parseInt(value) : undefined),
      healthProfessionalId: (value: string) =>
        value ? parseInt(value) : undefined,
      status: (value: string) => value as AppointmentFilters["status"],
      appointmentType: (value: string) =>
        value as AppointmentFilters["appointmentType"],
      priority: (value: string) => value as AppointmentFilters["priority"],
      sortOrder: (value: string) => value as "asc" | "desc",
      appointmentDateFrom: (value: string) =>
        value ? new Date(value).toISOString() : undefined,
      appointmentDateTo: (value: string) =>
        value ? new Date(value).toISOString() : undefined,
    },
    serializers: {
      appointmentDateFrom: (value: string) =>
        value ? new Date(value).toISOString().split("T")[0] : "",
      appointmentDateTo: (value: string) =>
        value ? new Date(value).toISOString().split("T")[0] : "",
    },
  } as const;

  const result = useSearchParams<AppointmentFilters>({
    ...config,
    excludeFromUrl: [
      "paginated",
      "page",
      "limit",
    ] as (keyof AppointmentFilters)[],
  });

  // Add with relations to the filters if provided
  const filtersWithRelations = withRelations
    ? { ...result.filters, with: withRelations }
    : result.filters;

  return {
    ...result,
    filters: filtersWithRelations,
  };
}
