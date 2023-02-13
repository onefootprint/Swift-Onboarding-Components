use crate::*;

use super::onboarding_requirement::{AuthorizeFields, OnboardingRequirement};

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct OnboardingStatusResponse {
    pub requirements: Vec<OnboardingRequirement>,
    pub fields_to_authorize: Option<AuthorizeFields>,
}

export_schema!(OnboardingStatusResponse);
