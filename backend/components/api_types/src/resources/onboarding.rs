use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Onboarding {
    pub name: String,
    pub timestamp: DateTime<Utc>,
    pub kyc_status: KycStatus,
    pub can_access_data: Vec<CollectedDataOption>,
    pub can_access_data_attributes: Vec<DataAttribute>,
    pub insight_event: InsightEvent,
}

export_schema!(Onboarding);
