use crate::*;
use newtypes::D2pSessionStatus;
use newtypes::HandoffMetadata;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pUpdateStatusRequest {
    pub status: D2pSessionStatus,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct D2pStatusResponse {
    pub status: D2pSessionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<HandoffMetadata>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pGenerateRequest {
    pub meta: Option<HandoffMetadata>,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct D2pGenerateResponse {
    pub auth_token: SessionAuthToken,
}
