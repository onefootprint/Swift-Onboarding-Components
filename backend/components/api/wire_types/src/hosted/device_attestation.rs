use crate::*;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct GetDeviceAttestationChallengeRequest {
    pub device_type: DeviceAttestationType,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum DeviceAttestationType {
    Ios,
    Android,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct DeviceAttestationChallengeResponse {
    /// state token to send back along with attestation
    pub state: String,
    /// attestation challenge to use
    pub attestation_challenge: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct CreateDeviceAttestationRequest {
    /// state from `DeviceAttestationChallengeResponse`
    pub state: String,
    /// base64 encoded attestation  
    pub attestation: String,
}

export_schema!(GetDeviceAttestationChallengeRequest);
export_schema!(DeviceAttestationChallengeResponse);
export_schema!(DeviceAttestationType);
export_schema!(CreateDeviceAttestationRequest);
