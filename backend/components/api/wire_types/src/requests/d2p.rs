use crate::*;
use newtypes::{
    D2pSessionStatus,
    HandoffMetadata,
    SessionAuthToken,
};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pUpdateStatusRequest {
    pub status: D2pSessionStatus,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct D2pStatusResponse {
    pub status: D2pSessionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<HandoffMetadata>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pGenerateRequest {
    pub meta: Option<HandoffMetadata>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct D2pGenerateResponse {
    pub auth_token: SessionAuthToken,
}
