use crate::*;
use newtypes::{
    AuthEventKind,
    IdentifyScope,
    ModernAuthEventKind,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct AuthEvent {
    /// Information on from where the auth occurred
    pub insight: Option<InsightEvent>,
    /// A list of assoicated attested devices
    pub linked_attestations: Vec<AttestedDeviceData>,
    pub kind: AuthEventKind,
    pub created_at: DateTime<Utc>,
    pub scope: IdentifyScope,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct PublicAuthEvent {
    /// Information on from where the auth occurred
    pub insight: Option<PublicInsightEvent>,
    pub kind: ModernAuthEventKind,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]

pub struct AttestedDeviceData {
    pub app_bundle_id: String,
    pub model: Option<String>,
    pub os: Option<String>,
    pub fraud_risk: Option<DeviceFraudRiskLevel>,
    pub device_type: DeviceType,
    // TODO: more here
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]

pub enum DeviceFraudRiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]

pub enum DeviceType {
    Ios,
    Android,
}
