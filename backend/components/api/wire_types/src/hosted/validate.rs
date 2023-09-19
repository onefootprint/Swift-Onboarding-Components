use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct HostedValidateResponse {
    pub validation_token: SessionAuthToken,
}

export_schema!(HostedValidateResponse);
