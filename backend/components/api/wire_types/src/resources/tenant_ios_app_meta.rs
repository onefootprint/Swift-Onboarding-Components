use crate::*;
use newtypes::{
    TenantId,
    TenantIosAppMetaId,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TenantIosAppMeta {
    pub id: TenantIosAppMetaId,
    pub tenant_id: TenantId,
    pub team_id: String,
    pub app_bundle_ids: Vec<String>,
    pub device_check_key_id: String,
    pub device_check_private_key: Option<String>,
}
