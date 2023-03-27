use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct SocureDeviceSessionIdRequest {
    pub device_session_id: String,
}

export_schema!(SocureDeviceSessionIdRequest);
