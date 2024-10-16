use crate::backfill::BatchBackfillRequest;
use crate::backfill::BatchBackfillResponse;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::errors::ValidationError;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiResponse;
use api_core::State;
use api_errors::FpResult;
use db::models::fingerprint::Fingerprint as DbFingerprint;
use db::models::fingerprint::NewFingerprintArgs;
use db::DbError;
use db_schema::schema::fingerprint;
use diesel::prelude::*;
use diesel::QueryDsl;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::Fingerprint;
use newtypes::ScopedVaultId;

#[post("/private/backfill/fingerprint_verified_ci")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BatchBackfillRequest<ScopedVaultId>>,
    _: ProtectedAuth,
) -> ApiResponse<BatchBackfillResponse> {
    let BatchBackfillRequest {
        concurrency,
        entity_ids: sv_ids,
        shard_config: _,
    } = request.into_inner();

    let vws_fut = sv_ids
        .into_iter()
        .map(|sv_id| backfill_fingerprints(&state, sv_id))
        .collect_vec();

    let futs = futures::stream::iter(vws_fut).buffer_unordered(concurrency);
    futs.collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<FpResult<Vec<_>>>()?;

    let response = BatchBackfillResponse {};
    Ok(response)
}

#[tracing::instrument(skip_all)]
async fn backfill_fingerprints(state: &State, sv_id: ScopedVaultId) -> FpResult<()> {
    let vw: TenantVw = state
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
        .await?;

    let sv = vw.scoped_vault.clone();
    let tenant_id = &sv.tenant_id;

    let data_to_fp = vw
        .populated_dis()
        .iter()
        .filter(|di| di.is_verified_ci())
        .flat_map(|di| vw.data(di))
        .filter_map(|d| d.data.vd())
        .flat_map(|d| {
            let fps = d.kind.get_fingerprint_payload(&d.e_data, Some(tenant_id));
            // Attach a Key to each fingerprint payload that includes the lifetime ID and salt
            fps.into_iter()
                .map(|(salt, fp)| ((salt.clone(), d.lifetime_id.clone()), (salt, fp)))
        })
        .collect_vec();
    let fingerprints = state
        .enclave_client
        .batch_fingerprint_sealed(&vw.vault.e_private_key, data_to_fp)
        .await?;

    state
        .db_transaction(move |conn| -> FpResult<()> {
            let vw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv.id)?;
            // Don't need composite fingerprints here
            let fps_to_insert = fingerprints.iter().flat_map(|((salt, dl_id), sh_data)| {
                let d = NewFingerprintArgs {
                    kind: salt.di().into(),
                    data: sh_data.clone().into(),
                    lifetime_ids: vec![&dl_id],
                    scope: salt.scope()?,
                    version: newtypes::FingerprintVersion::current(),
                    // Denormalized fields
                    scoped_vault_id: &sv.id,
                    vault_id: &sv.vault_id,
                    tenant_id: &sv.tenant_id,
                    is_live: sv.is_live,
                };
                Some((sh_data, d))
            }).collect_vec();

            // We are susceptible to a race condition... Our fingerprints may be stale if the
            // vault data changed since we computed them. This may happen since we cannot lock the
            // vault while computing partial fingerprints.
            // If the partial fingeprints are stale, we've made the arbitrary decision to error.
            for ((salt, dl_id), _) in fingerprints.iter() {
                let new_dl_id = vw.get_lifetime(&salt.di()).map(|dl| &dl.id);
                if new_dl_id != Some(dl_id) {
                    return Err(ValidationError("Operation aborted due to a concurrent update on this user. Please retry this request").into());
                }
            }

            let sh_datas = fps_to_insert.iter().map(|(sh_data, _)| sh_data).collect_vec();
            let existing_fps = fingerprint::table
                .filter(fingerprint::vault_id.eq(&sv.vault_id))
                .filter(fingerprint::tenant_id.eq(&sv.tenant_id))
                .filter(fingerprint::is_live.eq(sv.is_live))
                .filter(fingerprint::deactivated_at.is_null())
                .filter(fingerprint::sh_data.is_not_null())
                .filter(fingerprint::sh_data.eq_any(sh_datas))
                .select(fingerprint::sh_data.assume_not_null())
                .get_results::<Fingerprint>(conn.conn())
                .map_err(DbError::from)?;

            // Don't make duplicate fingerprints
            let fps = fps_to_insert.into_iter().filter(|(sh_data, _)| !existing_fps.contains(sh_data)).map(|(_, fp)| fp).collect_vec();
            DbFingerprint::bulk_create(conn, fps)?;
            Ok(())
        })
        .await?;

    Ok(())
}
