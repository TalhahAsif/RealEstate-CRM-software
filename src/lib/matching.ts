import type {
  CustomerType,
  CustomerPurpose,
  CustomerStatus,
  PropertyType,
  ListingType,
  PropertyStatus,
} from "@/types";

/** Minimal shape needed from a customer to score it against a property. */
export interface MatchableCustomer {
  type: CustomerType;
  status?: CustomerStatus;
  purpose?: CustomerPurpose;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  preferredPropertyTypes?: PropertyType[];
  bedrooms?: number;
}

/** Minimal shape needed from a property to score it against a customer. */
export interface MatchableProperty {
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  city?: string;
  location?: string;
  bedrooms?: number;
}

/** Which listing type a customer is in the market for, based on their type. */
function wantedListingType(customerType: CustomerType): ListingType {
  return customerType === "renter" ? "rent" : "sale";
}

const BUDGET_FLEX = 0.1;

/**
 * Scores how well a property fits a customer's requirements.
 * Returns null when the property is disqualified (wrong listing type, out of budget, wrong status).
 * Otherwise returns a positive score, higher is a better match.
 */
export function scoreMatch(
  customer: MatchableCustomer,
  property: MatchableProperty
): number | null {
  if (property.status !== "available") return null;
  if (customer.status && customer.status !== "active") return null;

  if (property.listingType !== wantedListingType(customer.type)) return null;

  let score = 1;

  const hasMin = customer.budgetMin != null;
  const hasMax = customer.budgetMax != null;
  if (hasMin || hasMax) {
    const min = customer.budgetMin ?? 0;
    const max = customer.budgetMax ?? Infinity;
    const flexMin = min * (1 - BUDGET_FLEX);
    const flexMax = max === Infinity ? Infinity : max * (1 + BUDGET_FLEX);

    if (property.price < flexMin || property.price > flexMax) return null;

    score += property.price >= min && property.price <= max ? 40 : 20;
  }

  if (customer.preferredPropertyTypes?.length) {
    score += customer.preferredPropertyTypes.includes(property.propertyType) ? 25 : 0;
  }

  if (customer.preferredLocations?.length) {
    const haystack = `${property.city ?? ""} ${property.location ?? ""}`.toLowerCase();
    const matched = customer.preferredLocations.some((loc) =>
      haystack.includes(loc.trim().toLowerCase())
    );
    score += matched ? 25 : 0;
  }

  if (customer.bedrooms != null && property.bedrooms != null) {
    score += property.bedrooms >= customer.bedrooms ? 10 : 0;
  }

  return score;
}

export interface ScoredMatch<T> {
  item: T;
  score: number;
}

/** Ranks properties against a customer's requirements, best match first. */
export function findMatchingProperties<T extends MatchableProperty>(
  customer: MatchableCustomer,
  properties: T[]
): ScoredMatch<T>[] {
  return properties
    .map((property) => ({ item: property, score: scoreMatch(customer, property) }))
    .filter((match): match is ScoredMatch<T> => match.score !== null)
    .sort((a, b) => b.score - a.score);
}

/** Ranks customers against a property's fit, best match first. */
export function findMatchingCustomers<T extends MatchableCustomer>(
  property: MatchableProperty,
  customers: T[]
): ScoredMatch<T>[] {
  return customers
    .map((customer) => ({ item: customer, score: scoreMatch(customer, property) }))
    .filter((match): match is ScoredMatch<T> => match.score !== null)
    .sort((a, b) => b.score - a.score);
}
