use crate::*;

/// Request containing a short-lived validation token that is used to verify auth and the end of
/// an onboarding session.
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct ValidateRequest {
    pub validation_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, JsonSchema)]
pub struct LegacyValidateResponse {
    pub user: EntityValidateResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub business: Option<EntityValidateResponse>,

    // Legacy fields
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Deprecated
    pub footprint_user_id: Option<FpId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Deprecated
    pub status: Option<OnboardingStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Deprecated
    pub requires_manual_review: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Deprecated
    pub onboarding_configuration_id: Option<ObConfigurationId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Deprecated
    pub timestamp: Option<DateTime<Utc>>,
}

export_schema!(LegacyValidateResponse);

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct EntityValidateResponse {
    pub fp_id: FpId,
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
}
export_schema!(EntityValidateResponse);

// Manually implement Apiv2Schema for ValidateResponse since we can't otherwise hide the deprecated fields

impl paperclip::v2::schema::Apiv2Schema for LegacyValidateResponse {
    fn name() -> Option<String> {
        Some("ValidateResponse".to_string())
    }
    // These aren't used - only `name()` is used to trick the spec into thinking the API returns
    // a ValidateResponse instance below
    fn description() -> &'static str {
        ""
    }
    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        ValidateResponse::raw_schema()
    }
}

// This struct isn't used anywhere - its auto-generated Apiv2Schema is simply used in place of
// autogenerating one for ValidateResponse above - there doesn't seem to be a way to hide the
// deprecated fields in the open API spec for ValidateResponse...

#[derive(Apiv2Schema)]
struct ValidateResponse {
    #[allow(unused)]
    user: EntityValidateResponse,
    #[allow(unused)]
    business: Option<EntityValidateResponse>,
}
