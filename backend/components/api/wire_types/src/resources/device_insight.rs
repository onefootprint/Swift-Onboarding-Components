use crate::*;

/// Describes a device insight event
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct AuthEvent {
    pub id: AuthEventId,
    /// represents user agent and IP information
    pub insight: Option<InsightEvent>,
    /// a list of assoicated attested devices
    pub linked_attestations: Vec<AttestedDeviceData>,
    pub kind: AuthEventKind,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[schemars(rename_all = "camelCase")]
pub struct AttestedDeviceData {
    pub app_bundle_id: String,
    pub model: Option<String>,
    pub os: Option<String>,
    pub fraud_risk: Option<DeviceFraudRiskLevel>,
    pub device_type: DeviceType,
    // TODO: more here
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[schemars(rename_all = "camelCase")]
pub enum DeviceFraudRiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[schemars(rename_all = "camelCase")]
pub enum DeviceType {
    Ios,
    Android,
}

export_schema!(AuthEvent);
export_schema!(AttestedDeviceData);
export_schema!(DeviceFraudRiskLevel);

export_schema!(DeviceType);
