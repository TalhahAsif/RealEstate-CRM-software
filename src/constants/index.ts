// Central source of truth for enum-like values shared across models,
// validation schemas, and UI (selects, badges, filters).

export const USER_ROLES = [
  "super_admin",
  "admin",
  "manager",
  "agent",
  "accountant",
  "viewer",
] as const;

export const LEAD_SOURCES = [
  "website",
  "referral",
  "walk_in",
  "social_media",
  "advertisement",
  "cold_call",
  "portal",
  "other",
] as const;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "follow_up",
  "site_visit",
  "negotiation",
  "won",
  "lost",
] as const;

export const LEAD_PRIORITIES = ["hot", "warm", "cold"] as const;

export const CUSTOMER_TYPES = ["buyer", "investor", "for_rent"] as const;

export const CUSTOMER_PURPOSES = ["living", "investment"] as const;

export const CUSTOMER_STATUSES = ["active", "purchased", "rented", "on_hold"] as const;

export const POSSESSION_TYPES = ["ready_to_move", "by_date"] as const;

export const ACQUISITION_TYPES = ["direct", "broker"] as const;

export const PROPERTY_TYPES = [
  "flat/apartment",
  "portion",
  "plots",
  "office",
  "shop",
  "silent-commercial",
  "townhouse",
  "bungalow",
] as const;

/** Property types that have bedrooms; plots/offices/shops don't. */
export const BEDROOM_PROPERTY_TYPES = [
  "flat/apartment",
  "portion",
  "silent-commercial",
  "townhouse",
  "bungalow",
] as const;

export const LISTING_TYPES = ["sale", "rent"] as const;

export const PROPERTY_STATUSES = [
  "available",
  "reserved",
  "on_hold",
  "sold",
  "rented",
  "inactive",
] as const;

export const PROPERTY_FACING = ["west", "cross_west", "east"] as const;

/** Common boolean features, stored as tags inside a property's `amenities` list. */
export const PROPERTY_FEATURES = [
  "servant_quarter",
  "powder_washroom",
  "standby_generator",
  "lift",
] as const;

export const PROPERTY_SOURCE = [
  "direct",
  "one_down",
  "two_down",
] as const;

export const AREA_UNITS = ["sqft", "sqyd", "sqm", "marla", "kanal", "acre"] as const;

export const PROPERTY_CONDITIONS = [
  "furnished",
  "semi_furnished",
  "builder_condition",
  "well_maintained",
  "renovated",
  "other",
] as const;

export const PROJECT_STATUSES = [
  "upcoming",
  "under_construction",
  "completed",
] as const;

export const FOLLOW_UP_TYPES = [
  "call",
  "whatsapp",
  "email",
  "meeting",
  "site_visit",
  "other",
] as const;

export const FOLLOW_UP_STATUSES = ["pending", "completed", "cancelled"] as const;

export const SITE_VISIT_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

export const DEAL_STAGES = [
  "property_selected",
  "site_visit",
  "negotiation",
  "booking",
  "closed",
  "cancelled",
] as const;

export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "cheque",
  "card",
  "online",
  "other",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const COMMISSION_STATUSES = [
  "pending",
  "partially_paid",
  "paid",
] as const;

export const DOCUMENT_TYPES = [
  "contract",
  "id_proof",
  "agreement",
  "brochure",
  "invoice",
  "other",
] as const;

export const DOCUMENT_ENTITY_TYPES = [
  "lead",
  "customer",
  "property",
  "project",
  "deal",
  "user",
] as const;

export const NAV_SECTIONS = [
  {
    title: "CRM",
    items: [
      { label: "Leads", href: "/leads" },
      { label: "Customers", href: "/customers" },
      { label: "Follow-ups", href: "/follow-ups" },
      { label: "Site Visits", href: "/site-visits" },
    ],
  },
  {
    title: "Properties",
    items: [
      { label: "Properties", href: "/properties" },
      { label: "Projects", href: "/projects" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Deals", href: "/deals" },
      { label: "Payments", href: "/payments" },
      { label: "Commissions", href: "/commissions" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Documents", href: "/documents" },
      { label: "Users", href: "/users" },
    ],
  },
] as const;
