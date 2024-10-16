use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::custodian::CustodianAuthContext;
use api_core::ApiResponse;
use api_core::State;
use api_errors::AssertionError;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::schema::data_lifetime;
use db::schema::scoped_vault;
use db::schema::scoped_vault_version;
use db::schema::vault_dr_blob;
use db::DbError;
use db::DbResult;
use diesel::prelude::*;
use newtypes::FpId;
use newtypes::VaultDrConfigId;


/// Sometimes we need to overwrite historical data to correct mistakes. If DLs are added, removed,
/// or replaced on a ScopedVault at existing ScopedVaultVersions, Vault Disaster Recovery (VDR) can
/// update the backups accordingly. However, VDR can not insert or delete existing
/// ScopedVaultVersions, since it assumes that the version numbers are monotonic with respect to
/// insertion time.
///
/// To signal to VDR that a DL needs to be backed up again, we have to do two things:
/// 1. Delete any vault_dr_blobs corresponding to DLs that are being deleted. This is necessary only
///    if we need to delete DLs due to the foreign key constraint on
///    vault_dr_blob(data_lifetime_id).
/// 2. Mark all scoped_vault_version rows for the Scoped Vault that have a seqno >= the impacted DLS
///    as not backed up by VDR by setting backed_up_by_vdr_config_id to null.
///
/// This works because
/// a) blobs in a VDR backup bucket are not read without being referenced by manifests, so we don't
///    need to clean up orphaned VDR blobs in S3
/// b) blob keys are deterministic with respect to (VdrConfig, DataLifetime), so overwritten vault
///    data for an existing DataLifetime will replace the old blob in the backup bucket
/// c) manifests keys map to Scoped Vault Version Numbers, so as long as we don't add or remove
///    Scoped Vault Versions, manifests will be updated in place
///
/// However, this is only valid if there are no concurrent writers to backed_up_by_vdr_config_id.
/// Therefore, the VDR worker must be stopped while the backfill overwrites
/// backed_up_by_vdr_config_id. This can be achieved using the DisableVaultDisasterRecoveryWorker
/// feature flag. For integration tests, there is no continuously running worker, only the
/// /private/vault_dr/run_batch endpoint, so we don't need to worry about this.
///
/// This endpoint performs this operation on a vault in an integration test tenant so we can check
/// that the above process works as intended.
#[post("/private/vault_dr/test_backfill")]
pub async fn post(
    state: web::Data<State>,
    request: Json<Vec<FpId>>,
    _auth: CustodianAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    if !state.config.service_config.is_local() {
        return AssertionError("This endpoint is only usable in integration tests").into();
    }

    let fp_ids = request.into_inner();

    state
        .db_transaction(move |conn| -> DbResult<()> {
            for fp_id in fp_ids {
                tracing::info!("Running test backfill for fp_id: {:?}", &fp_id);
                let sv: ScopedVault = scoped_vault::table
                    .filter(scoped_vault::fp_id.eq(fp_id))
                    .first(conn.conn())?;

                let tenant = Tenant::get(conn, &sv.tenant_id)?;

                if !tenant.id.is_integration_test_tenant() {
                    return Err(DbError::ValidationError(
                        "Unsupported tenant for this API".to_string(),
                    ));
                }

                // Pick a single DL deterministically.
                let dls: Vec<DataLifetime> = data_lifetime::table
                    .filter(data_lifetime::scoped_vault_id.eq(&sv.id))
                    .order_by(data_lifetime::created_seqno)
                    .load(conn.conn())?;

                let dl = if dls.len() >= 3 {
                    // Choose the second DL to get interesting behavior (i.e. some DLs before the
                    // chosen one and some after).
                    dls.into_iter().nth(1)
                } else {
                    dls.into_iter().next()
                };
                let dl = dl.ok_or(DbError::ValidationError("No data for this fp_id".to_string()))?;


                // Delete the corresponding VDR blob.
                diesel::delete(vault_dr_blob::table.filter(vault_dr_blob::data_lifetime_id.eq(dl.id)))
                    .execute(conn.conn())?;

                // Mark each impacted ScopedVaultVersion as not backed up.
                diesel::update(
                    scoped_vault_version::table
                        .filter(scoped_vault_version::scoped_vault_id.eq(&sv.id))
                        .filter(scoped_vault_version::seqno.ge(&dl.created_seqno)),
                )
                .set(scoped_vault_version::backed_up_by_vdr_config_id.eq(None as Option<VaultDrConfigId>))
                .execute(conn.conn())?;
            }

            Ok(())
        })
        .await?;


    Ok(api_wire_types::Empty)
}
