use crate::*;

/// Describes a device insight event
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct AuthEvent {
    pub id: AuthEventId,
    /// represents user agent and IP information
    pub insight: Option<InsightEvent>,
    /// a list of assoicated attested devices
    pub linked_attestations: Vec<AttestedDeviceData>,
    pub kind: AuthEventKind,
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
