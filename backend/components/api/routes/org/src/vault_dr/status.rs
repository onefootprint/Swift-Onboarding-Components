use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::State;
use api_errors::FpDbOptionalExtension;
use db::models::vault_dr::VaultDrConfig;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};
use vault_dr::get_backup_status;
use vault_dr::BackupStatus;

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Returns the status of Vault Disaster Recovery for the authenticated organization"
)]
#[actix::get("/org/vault_dr/status")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
) -> ApiResponse<api_wire_types::VaultDrStatus> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;

    let maybe_config = state
        .db_query(move |conn| {
            let maybe_config = VaultDrConfig::get(conn, (&tenant_id, is_live)).optional()?;
            Ok(maybe_config)
        })
        .await?;

    let enrolled_status = if let Some(config) = maybe_config {
        let BackupStatus {
            latest_backup_record_timestamp,
            lag_seconds,
        } = get_backup_status(&state, &config.id).await?;

        Some(api_wire_types::VaultDrEnrolledStatus {
            enrolled_at: config.created_at,
            aws_account_id: config.aws_account_id,
            aws_role_name: config.aws_role_name,
            s3_bucket_name: config.s3_bucket_name,
            bucket_path_namespace: config.bucket_path_namespace,
            org_public_keys: config.org_public_keys,
            latest_backup_record_timestamp,
            backup_lag_seconds: lag_seconds,
        })
    } else {
        None
    };

    Ok(api_wire_types::VaultDrStatus {
        org_id: tenant.id.clone(),
        org_name: tenant.name.clone(),
        is_live: auth.is_live()?,
        enrolled_status,
    })
}
