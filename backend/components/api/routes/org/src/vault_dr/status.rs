use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use db::errors::FpOptionalExtension;
use db::helpers::get_latest_vault_dr_backup_record_timestamp;
use db::helpers::get_latest_vault_dr_online_record_timestamp;
use db::models::vault_dr::VaultDrConfig;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Returns the status of Vault Disaster Recovery for the authenticated organization"
)]
#[actix::get("/org/vault_dr/status")]
pub async fn get(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> ApiResponse<api_wire_types::VaultDrStatus> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;

    let enrolled_status = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let maybe_config = VaultDrConfig::get(conn, (&tenant_id, is_live)).optional()?;
            let Some(config) = maybe_config else {
                return Ok(None);
            };

            let latest_backup_record_timestamp =
                get_latest_vault_dr_backup_record_timestamp(conn, &config.id)?;
            let latest_online_record_timestamp =
                get_latest_vault_dr_online_record_timestamp(conn, &config.tenant_id, config.is_live)?;

            let enrolled_status = api_wire_types::VaultDrEnrolledStatus {
                enrolled_at: config.created_at,
                aws_account_id: config.aws_account_id,
                aws_role_name: config.aws_role_name,
                s3_bucket_name: config.s3_bucket_name,
                org_public_keys: config.org_public_keys,
                latest_backup_record_timestamp,
                latest_online_record_timestamp,
            };
            Ok(Some(enrolled_status))
        })
        .await?;


    Ok(api_wire_types::VaultDrStatus {
        org_id: tenant.id.clone(),
        org_name: tenant.name.clone(),
        is_live: auth.is_live()?,
        enrolled_status,
    })
}
