use crate::*;
use newtypes::TenantId;
use newtypes::TenantScope;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateAccessRequestRequest {
    pub tenant_id: TenantId,
    pub scopes: Vec<TenantScope>,
    pub reason: Option<String>,
    /// Duration in hours for how long the access is needed, defaults to 8 hours
    #[serde(default = "default_duration_hours")]
    pub duration_hours: i64,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ListAccessRequestsRequest {
    pub approved: Option<bool>,
}


fn default_duration_hours() -> i64 {
    8
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct PatchAccessRequestRequest {
    pub approved: bool,
}
