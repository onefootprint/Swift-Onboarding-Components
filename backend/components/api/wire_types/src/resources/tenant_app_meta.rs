use crate::*;
use newtypes::{TenantAppKind, TenantAppMetaId};

/// Frequently used note for an Org
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TenantAppMeta {
    pub id: TenantAppMetaId,
    pub name: String,
    pub kind: TenantAppKind,
    pub ios_app_bundle_id: Option<String>,       // Only set for iOS
    pub ios_team_id: Option<String>,             // Only set for iOS
    pub android_package_name: Option<String>,    // Only set for Android
    pub android_apk_cert_sha256: Option<String>, // Only set for Android
}
