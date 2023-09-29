use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct UserId {
    pub id: FpId,
}

/// Basic information about a user
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct User {
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: Option<OnboardingStatus>,
}

export_schema!(UserId);
export_schema!(User);
