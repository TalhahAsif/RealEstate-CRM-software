import { fromRupees } from "./currency";

/** Formats a rupee amount using lac/cr, e.g. 3500000 -> "Rs 35 Lac", 35000000 -> "Rs 3.5 Cr". */
export function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (Math.abs(value) < 100_000) {
    return `Rs ${value.toLocaleString("en-IN")}`;
  }
  const { amount, unit } = fromRupees(value);
  return `Rs ${amount} ${unit === "cr" ? "Cr" : "Lac"}`;
}

/** Formats a date as "Jan 5, 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Turns "follow_up" -> "Follow Up" for display in badges and labels. */
export function toTitleCase(value?: string | null): string {
  if (!value) return "—";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Builds initials from a first/last name pair, e.g. "Jane", "Doe" -> "JD". */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
