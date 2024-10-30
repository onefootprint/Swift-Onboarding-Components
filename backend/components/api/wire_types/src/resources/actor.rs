use crate::*;
use newtypes::FpId;
use newtypes::TenantApiKeyId;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum Actor {
    /// A user onboarding with Footprint.
    User { id: FpId },
    /// A Footprint automated process
    Footprint,
    /// A Footprint employee via the dashboard
    FirmEmployee,
    /// A dashboard user for a tenant
    Organization {
        member: String,
        email: String,
        first_name: Option<String>,
        last_name: Option<String>,
    },
    /// A tenant API key
    ApiKey { id: TenantApiKeyId, name: String },
}
