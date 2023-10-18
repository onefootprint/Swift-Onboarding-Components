use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct SocureDeviceSessionIdRequest {
    pub device_session_id: String,
}
