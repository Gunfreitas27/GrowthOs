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

// ─── Growth OS Modules ───────────────────────────────────────────────────────

export type FunnelStageType = "awareness" | "acquisition" | "activation" | "retention" | "revenue" | "referral";
export type ExperimentStatus = "idea" | "backlog" | "in_progress" | "paused" | "completed" | "archived";
export type ExperimentResult = "win" | "loss" | "inconclusive";
export type LearningCategory = "copy" | "ux" | "pricing" | "onboarding" | "activation" | "retention" | "channel" | "other";
export type LearningImpactLevel = "high" | "medium" | "low";
export type LearningResultType = "validated" | "invalidated" | "inconclusive";

export const FunnelStageType = {
    AWARENESS: "awareness" as const,
    ACQUISITION: "acquisition" as const,
    ACTIVATION: "activation" as const,
    RETENTION: "retention" as const,
    REVENUE: "revenue" as const,
    REFERRAL: "referral" as const,
};

export const ExperimentStatus = {
    IDEA: "idea" as const,
    BACKLOG: "backlog" as const,
    IN_PROGRESS: "in_progress" as const,
    PAUSED: "paused" as const,
    COMPLETED: "completed" as const,
    ARCHIVED: "archived" as const,
};

export const ExperimentResult = {
    WIN: "win" as const,
    LOSS: "loss" as const,
    INCONCLUSIVE: "inconclusive" as const,
};

export const LearningCategory = {
    COPY: "copy" as const,
    UX: "ux" as const,
    PRICING: "pricing" as const,
    ONBOARDING: "onboarding" as const,
    ACTIVATION: "activation" as const,
    RETENTION: "retention" as const,
    CHANNEL: "channel" as const,
    OTHER: "other" as const,
};

export const LearningResultType = {
    VALIDATED: "validated" as const,
    INVALIDATED: "invalidated" as const,
    INCONCLUSIVE: "inconclusive" as const,
};
