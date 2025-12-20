/**
 * Utility functions for displaying health professional information
 */

/**
 * Professional type to title mapping
 */
const PROFESSIONAL_TITLES: Record<string, string> = {
  // Doctors and Physicians
  doctor: "Dr.",
  physician: "Dr.",
  psychologist: "Dr.",
  psychiatrist: "Dr.",
  radiologist: "Dr.",
  cardiologist: "Dr.",
  dermatologist: "Dr.",
  orthopedist: "Dr.",
  pediatrician: "Dr.",
  gynecologist: "Dr.",
  urologist: "Dr.",
  neurologist: "Dr.",
  oncologist: "Dr.",
  anesthesiologist: "Dr.",
  surgeon: "Dr.",
  specialist: "Dr.",

  // Nurses
  nurse: "Nurse",
  registered_nurse: "Nurse",
  rn: "Nurse",
  nurse_practitioner: "NP",
  np: "NP",

  // Physician Assistants
  physician_assistant: "PA",
  pa: "PA",

  // Therapists
  therapist: "PT",
  physical_therapist: "PT",
  pt: "PT",
  occupational_therapist: "OT",
  ot: "OT",
  speech_therapist: "ST",
  st: "ST",

  // Pharmacists
  pharmacist: "PharmD",

  // Technicians
  technician: "Tech",
  lab_technician: "Tech",

  // Administrative
  administrator: "Admin",
  admin: "Admin",
  assistant: "Asst.",

  // No title
  receptionist: "",
};

/**
 * Get the appropriate title prefix for a health professional based on their type
 * @param type - The health professional type
 * @returns The appropriate title prefix
 */
export function getProfessionalTitle(type: string): string {
  if (!type) return "";

  return PROFESSIONAL_TITLES[type.toLowerCase()] || "";
}

/**
 * Format a health professional's full name with appropriate title
 * @param professional - The health professional object
 * @returns Formatted name string
 */
export function formatProfessionalName(professional: {
  firstName?: string;
  lastName?: string;
  type?: string;
}): string {
  if (!professional) return "Unknown Professional";

  const { firstName, lastName, type } = professional;

  if (!firstName && !lastName) {
    return "Unknown Professional";
  }

  const title = getProfessionalTitle(type || "");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  if (!title) {
    return fullName;
  }

  return `${title} ${fullName}`;
}

/**
 * Format a health professional's name for display in lists or cards
 * @param professional - The health professional object
 * @param showType - Whether to show the type in parentheses
 * @returns Formatted name string
 */
export function formatProfessionalDisplayName(
  professional: {
    firstName?: string;
    lastName?: string;
    type?: string;
    specialty?: string;
  },
  showType: boolean = false
): string {
  if (!professional) return "Unknown Professional";

  const { firstName, lastName, type, specialty } = professional;

  if (!firstName && !lastName) {
    return "Unknown Professional";
  }

  const title = getProfessionalTitle(type || "");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  let displayName = title ? `${title} ${fullName}` : fullName;

  if (showType && specialty) {
    displayName += ` (${specialty})`;
  } else if (showType && type) {
    displayName += ` (${type})`;
  }

  return displayName;
}

/**
 * Get a short version of the professional name (first name + last initial)
 * @param professional - The health professional object
 * @returns Short formatted name string
 */
export function formatProfessionalShortName(professional: {
  firstName?: string;
  lastName?: string;
  type?: string;
}): string {
  if (!professional) return "Unknown";

  const { firstName, lastName, type } = professional;

  if (!firstName && !lastName) {
    return "Unknown";
  }

  const title = getProfessionalTitle(type || "");
  const shortName = lastName
    ? `${firstName || ""} ${lastName.charAt(0).toUpperCase()}.`
    : firstName || "";

  return title ? `${title} ${shortName}`.trim() : shortName;
}
