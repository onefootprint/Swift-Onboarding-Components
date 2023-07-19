use crate::*;

/// Object that represents a user Onboarding
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Onboarding {
    pub id: OnboardingId,
    pub is_authorized: bool,
    pub name: String,
    pub config_id: ObConfigurationId,
    // incomplete onboardings will show as null here. There is no codepath that does this today
    pub requires_manual_review: bool,
    pub manual_review: Option<ManualReview>,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
    pub insight_event: Option<InsightEvent>,
}

export_schema!(Onboarding);
