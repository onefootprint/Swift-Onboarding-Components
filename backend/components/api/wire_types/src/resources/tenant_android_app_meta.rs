use crate::*;
use newtypes::TenantAndroidAppMetaId;
use newtypes::TenantId;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct TenantAndroidAppMeta {
    pub id: TenantAndroidAppMetaId,
    pub tenant_id: TenantId,
    pub package_names: Vec<String>,
    pub apk_cert_sha256s: Vec<String>,
    pub integrity_verification_key: Option<String>,
    pub integrity_decryption_key: Option<String>,
}
