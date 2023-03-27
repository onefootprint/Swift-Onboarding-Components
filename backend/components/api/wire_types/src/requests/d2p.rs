use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct D2pUpdateStatusRequest {
    pub status: D2pSessionStatus,
}

export_schema!(D2pUpdateStatusRequest);

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, JsonSchema)]
pub struct D2pStatusResponse {
    pub status: D2pSessionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<HandoffMetadata>,
}

export_schema!(D2pStatusResponse);

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, JsonSchema)]
pub struct D2pGenerateRequest {
    pub meta: Option<HandoffMetadata>,
}

export_schema!(D2pGenerateRequest);

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, JsonSchema)]
pub struct D2pGenerateResponse {
    pub auth_token: SessionAuthToken,
}

export_schema!(D2pGenerateResponse);
