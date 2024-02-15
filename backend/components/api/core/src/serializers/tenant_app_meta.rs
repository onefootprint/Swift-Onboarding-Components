use crate::utils::db2api::DbToApi;
use db::models::tenant_app_meta::TenantAppMeta;

impl DbToApi<TenantAppMeta> for api_wire_types::TenantAppMeta {
    fn from_db(tfn: TenantAppMeta) -> Self {
        Self {
            id: tfn.id,
            name: tfn.name,
            kind: tfn.kind,
            ios_app_bundle_id: tfn.ios_app_bundle_id,
            ios_team_id: tfn.ios_team_id,
            android_package_name: tfn.android_package_name,
            android_apk_cert_sha256: tfn.android_apk_cert_sha256,
        }
    }
}
