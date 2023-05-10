use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct ValidateResponse {
    pub validation_token: SessionAuthToken,
}

export_schema!(ValidateResponse);
