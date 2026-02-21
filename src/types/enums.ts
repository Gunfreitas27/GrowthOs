// Type definitions for enum-like values (SQLite doesn't support enums)

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER" | "USER";
export type PlanType = "FREE" | "PRO" | "ENTERPRISE";
export type DataSourceType = "GOOGLE_ANALYTICS" | "GOOGLE_ADS" | "CRM_HUBSPOT" | "CRM_SALESFORCE" | "STRIPE" | "CUSTOM_CSV";
export type SyncStatus = "ACTIVE" | "CHECK_AUTH" | "ERROR" | "SYNCING";
export type MetricCategory = "ACQUISITION" | "ACTIVATION" | "RETENTION" | "REFERRAL" | "REVENUE";
export type ImpactLevel = "HIGH" | "MEDIUM" | "LOW";
export type RecStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED";
export type TicketStatus = "TODO" | "IN_PROGRESS" | "DONE";

// Constant objects for runtime usage
export const MetricCategory = {
    ACQUISITION: "ACQUISITION" as const,
    ACTIVATION: "ACTIVATION" as const,
    RETENTION: "RETENTION" as const,
    REFERRAL: "REFERRAL" as const,
    REVENUE: "REVENUE" as const,
};

export const Role = {
    OWNER: "OWNER" as const,
    ADMIN: "ADMIN" as const,
    EDITOR: "EDITOR" as const,
    VIEWER: "VIEWER" as const,
    USER: "USER" as const,
};

export const DataSourceType = {
    GOOGLE_ANALYTICS: "GOOGLE_ANALYTICS" as const,
    GOOGLE_ADS: "GOOGLE_ADS" as const,
    CRM_HUBSPOT: "CRM_HUBSPOT" as const,
    CRM_SALESFORCE: "CRM_SALESFORCE" as const,
    STRIPE: "STRIPE" as const,
    CUSTOM_CSV: "CUSTOM_CSV" as const,
};
