use crate::utils::db2api::DbToApi;
use db::models::tenant_ios_app_meta::TenantIosAppMeta;

type DbTenantIosAppMeta = (TenantIosAppMeta, Option<String>);

impl DbToApi<DbTenantIosAppMeta> for api_wire_types::TenantIosAppMeta {
    fn from_db((meta, device_check_private_key): DbTenantIosAppMeta) -> Self {
        let TenantIosAppMeta {
            id,
            tenant_id,
            team_id,
            app_bundle_ids,
            device_check_key_id,
            ..
        } = meta;

        Self {
            id,
            tenant_id,
            team_id,
            app_bundle_ids,
            device_check_key_id,
            device_check_private_key,
        }
    }
}
