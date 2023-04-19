use crate::*;

/// Object that represents a user Onboarding
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Onboarding {
    pub id: OnboardingId,
    pub is_authorized: bool,
    pub name: String,
    pub config_id: ObConfigurationId,
    // incomplete onboardings will show as null here. There is no codepath that does this today
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
    pub insight_event: InsightEvent,
    /// Represents the permissions that this approved onboarding gives to tenant users.
    pub can_access_permissions: Vec<TenantScope>,
    // TODO deprecate these
    /// DEPRECATED
    pub can_access_data: Vec<CollectedDataOption>,
}

export_schema!(Onboarding);
