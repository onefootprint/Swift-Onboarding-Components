use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use chrono::Utc;
use db::errors::FpOptionalExtension;
use db::helpers::vault_dr::get_latest_vault_dr_backup_record_timestamp;
use db::helpers::vault_dr::incorrect_get_vault_dr_data_lifetime_batch;
use db::models::vault_dr::VaultDrConfig;
use newtypes::preview_api;
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
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
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

            let next_batch = incorrect_get_vault_dr_data_lifetime_batch(
                conn,
                &config.tenant_id,
                config.is_live,
                &config.id,
                1,
                None,
            )?;

            let backup_lag_seconds = if let Some(next_dl) = next_batch.first() {
                // The lag is calculated as the difference between the current time and the time of
                // the next data lifetime that would be processed by the worker. This has the
                // following properties:
                // - The lag will remain zero if the worker has no new work.
                // - The lag will increase linearly starting from zero if the worker stops advancing
                //   (regardless of what newer DLs are written to the DB)
                // - The lag will be at most the batch poll period of the worker if every new DL is processed
                //   in the next batch, regardless of how often new DLs are created.
                //
                // Some alternatives that do not have all these properties:
                // - If we were to calculate the lag as the time between the current time and the last DL
                //   processed by the worker, the lag would increase even though the worker has no new work to
                //   do.
                // - If we were to calculate the lag as the time between the latest DL in the database and the
                //   latest DL processed by the worker, the the lag would stay constant even if the worker did
                //   no work for a long period of time. Additionally, if DLs are e.g. created once per hour
                //   but the poll period is once per 10 seconds, the lag would jump up to ~1h before the next
                //   poll period, and then quickly jump back to 0s. This makes point-in-time measurements of
                //   lag hard to interpret. Furthermore, if the worker erroneously processes data out of
                //   order, the lag may appear to be zero even if the worker has more work to do.

                let current_time = Utc::now();
                let lag = current_time.signed_duration_since(next_dl.created_at);

                // Clamp the lag to positive values to account for small amounts of clock drift.
                lag.num_seconds().max(0)
            } else {
                // Worker is up to date.
                0
            };

            let enrolled_status = api_wire_types::VaultDrEnrolledStatus {
                enrolled_at: config.created_at,
                aws_account_id: config.aws_account_id,
                aws_role_name: config.aws_role_name,
                s3_bucket_name: config.s3_bucket_name,
                bucket_path_namespace: config.bucket_path_namespace,
                org_public_keys: config.org_public_keys,
                latest_backup_record_timestamp,
                backup_lag_seconds,
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
