use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Onboarding {
    pub id: OnboardingId,
    pub config_id: ObConfigurationId,

    pub name: String,
    pub timestamp: DateTime<Utc>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub can_access_data_attributes: Vec<DataAttribute>,
    pub can_access_identity_document_images: bool,

    pub insight_event: InsightEvent,
    pub is_liveness_skipped: bool,

    pub status: OnboardingStatus,
}

export_schema!(Onboarding);
