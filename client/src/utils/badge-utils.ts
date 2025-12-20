/**
 * Utility functions for badge variants and styling
 */

/**
 * Appointment status to badge variant mapping
 */
const APPOINTMENT_STATUS_BADGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  // Successful states
  completed: "default", // Green/primary - successful completion
  in_progress: "default", // Green/primary - currently active

  // Confirmed states
  confirmed: "secondary", // Blue/secondary - confirmed and ready

  // Problem states
  cancelled: "destructive", // Red - cancelled
  no_show: "destructive", // Red - patient didn't show up

  // Default state
  scheduled: "outline", // Gray outline - scheduled but not yet confirmed
};

/**
 * Get the appropriate badge variant for appointment status
 * @param status - The appointment status
 * @returns The badge variant
 */
export function getAppointmentStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  return APPOINTMENT_STATUS_BADGE_VARIANTS[status] || "outline";
}

/**
 * Appointment priority to badge variant mapping
 */
const APPOINTMENT_PRIORITY_BADGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  // High priority
  urgent: "destructive", // Red - urgent priority
  high: "secondary", // Blue/secondary - high priority

  // Normal priority
  normal: "default", // Green/primary - normal priority

  // Low priority
  low: "outline", // Gray outline - low priority
};

/**
 * Get the appropriate badge variant for appointment priority
 * @param priority - The appointment priority
 * @returns The badge variant
 */
export function getAppointmentPriorityBadgeVariant(
  priority: string
): "default" | "secondary" | "destructive" | "outline" {
  return APPOINTMENT_PRIORITY_BADGE_VARIANTS[priority] || "outline";
}

/**
 * Get the appropriate badge variant for patient status
 * @param isActive - Whether the patient is active
 * @returns The badge variant
 */
export function getPatientStatusBadgeVariant(
  isActive: boolean
): "default" | "secondary" | "destructive" | "outline" {
  return isActive ? "default" : "secondary";
}

/**
 * Get the appropriate badge variant for health professional availability
 * @param isAvailable - Whether the health professional is available
 * @returns The badge variant
 */
export function getHealthProfessionalAvailabilityBadgeVariant(
  isAvailable: boolean
): "default" | "secondary" | "destructive" | "outline" {
  return isAvailable ? "default" : "secondary";
}
