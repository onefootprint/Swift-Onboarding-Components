use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct HostedValidateResponse {
    pub validation_token: SessionAuthToken,
}
