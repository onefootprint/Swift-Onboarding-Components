use crate::*;
use newtypes::TenantTagId;
use newtypes::VaultKind;

/// Tags for an Org
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct OrgTenantTag {
    pub id: TenantTagId,
    pub kind: VaultKind,
    pub tag: String,
}
