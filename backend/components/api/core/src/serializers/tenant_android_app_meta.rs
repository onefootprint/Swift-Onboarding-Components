use crate::utils::db2api::DbToApi;
use db::models::tenant_android_app_meta::TenantAndroidAppMeta;

type DbTenantAndroidAppMeta = (TenantAndroidAppMeta, Option<String>, Option<String>);

impl DbToApi<DbTenantAndroidAppMeta> for api_wire_types::TenantAndroidAppMeta {
    fn from_db((meta, integrity_verification_key, integrity_decryption_key): DbTenantAndroidAppMeta) -> Self {
        let TenantAndroidAppMeta {
            id,
            tenant_id,
            package_names,
            apk_cert_sha256s,
            ..
        } = meta;

        Self {
            id,
            tenant_id,
            package_names,
            apk_cert_sha256s,
            integrity_verification_key,
            integrity_decryption_key,
        }
    }
}
