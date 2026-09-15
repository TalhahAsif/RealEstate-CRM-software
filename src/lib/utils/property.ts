import { BEDROOM_PROPERTY_TYPES } from "@/constants";
import type { PropertyType } from "@/types";

/** Whether this property type has bedrooms (plots/offices/shops don't). */
export function hasBedrooms(propertyType: PropertyType): boolean {
  return (BEDROOM_PROPERTY_TYPES as readonly string[]).includes(propertyType);
}
