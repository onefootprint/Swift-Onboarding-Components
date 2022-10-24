use crate::*;

/// Object that represents a user Onboarding
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Onboarding {
    pub id: OnboardingId,
    pub name: String,
    pub config_id: ObConfigurationId,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
    pub is_liveness_skipped: bool,
    pub insight_event: InsightEvent,

    pub can_access_data: Vec<CollectedDataOption>,
    pub can_access_data_attributes: Vec<DataAttribute>,
    pub can_access_identity_document_images: bool,

    pub latest_decision: Option<OnboardingDecision>,
}

export_schema!(Onboarding);
