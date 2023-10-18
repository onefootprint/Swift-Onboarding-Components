use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct GetDeviceAttestationChallengeRequest {
    pub device_type: DeviceAttestationType,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "lowercase")]
pub enum DeviceAttestationType {
    Ios,
    Android,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct DeviceAttestationChallengeResponse {
    /// state token to send back along with attestation
    pub state: String,
    /// attestation challenge to use
    pub attestation_challenge: String,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct CreateDeviceAttestationRequest {
    /// state from `DeviceAttestationChallengeResponse`
    pub state: String,
    /// base64 encoded attestation  
    pub attestation: String,
}
