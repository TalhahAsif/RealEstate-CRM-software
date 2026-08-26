import type {
  USER_ROLES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  CUSTOMER_TYPES,
  CUSTOMER_PURPOSES,
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
  PROJECT_STATUSES,
  FOLLOW_UP_TYPES,
  FOLLOW_UP_STATUSES,
  SITE_VISIT_STATUSES,
  DEAL_STAGES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  COMMISSION_STATUSES,
  DOCUMENT_TYPES,
  DOCUMENT_ENTITY_TYPES,
  PROPERTY_SOURCE,
} from "@/constants";

export type UserRole = (typeof USER_ROLES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];
export type CustomerType = (typeof CUSTOMER_TYPES)[number];
export type CustomerPurpose = (typeof CUSTOMER_PURPOSES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ListingType = (typeof LISTING_TYPES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type PropertySource = (typeof PROPERTY_SOURCE)[number];
export type AreaUnit = (typeof AREA_UNITS)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type DocumentEntityType = (typeof DOCUMENT_ENTITY_TYPES)[number];

/** Generic shape returned by API route handlers. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
}
