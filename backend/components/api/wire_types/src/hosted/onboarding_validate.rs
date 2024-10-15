use crate::*;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedValidateResponse {
    pub validation_token: SessionAuthToken,
}
