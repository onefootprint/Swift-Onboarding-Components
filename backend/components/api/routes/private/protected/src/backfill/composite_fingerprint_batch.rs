use crate::backfill::BatchBackfillRequest;
use crate::backfill::BatchBackfillResponse;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::errors::AssertionError;
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
use db::DbResult;
use db_schema::schema::data_lifetime;
use db_schema::schema::fingerprint;
use db_schema::schema::scoped_vault;
use diesel::prelude::*;
use diesel::QueryDsl;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::CompositeFingerprint;
use newtypes::CompositeFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::Error;
use newtypes::Fingerprint;
use newtypes::ScopedVaultId;
use std::collections::HashMap;

#[post("/private/backfill/batch_composite_fingerprints")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BatchBackfillRequest<ScopedVaultId>>,
    _: ProtectedAuth,
) -> ApiResponse<BatchBackfillResponse> {
    let BatchBackfillRequest {
        concurrency,
        entity_ids,
        shard_config,
    } = request.into_inner();

    let sv_ids = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            // Filter out deactivated scoped vaults - causes other utils to crash
            let sv_ids = scoped_vault::table
                .filter(scoped_vault::id.eq_any(entity_ids))
                .filter(scoped_vault::deactivated_at.is_null())
                .select(scoped_vault::id)
                .get_results::<ScopedVaultId>(conn)?;
            Ok(sv_ids)
        })
        .await?;

    let sv_ids = if let Some(shard_config) = shard_config {
        sv_ids
            .into_iter()
            .filter(|sv_id| shard_config.select(sv_id))
            .collect()
    } else {
        sv_ids
    };

    let vws_fut = sv_ids
        .into_iter()
        .map(|sv_id| backfill_composite_fingerprints(&state, sv_id))
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
async fn backfill_composite_fingerprints(state: &State, sv_id: ScopedVaultId) -> FpResult<ScopedVaultId> {
    let vw: TenantVw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
        .await?;

    let sv = vw.scoped_vault.clone();
    let sv_id = sv.id.clone();
    let tenant_id = &vw.scoped_vault.tenant_id;

    // Enumerate active DIs for this specific scoped vault
    let sv_dis = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let dis = data_lifetime::table
                .filter(data_lifetime::scoped_vault_id.eq(&sv_id))
                .filter(data_lifetime::deactivated_at.is_null())
                .select(data_lifetime::kind)
                .distinct_on(data_lifetime::kind)
                .get_results::<DataIdentifier>(conn)
                .map_err(DbError::from)?;
            Ok(dis)
        })
        .await?;

    let data_to_fp = sv_dis
        .iter()
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
    let (fps, salt_to_dl_id): (HashMap<_, _>, HashMap<_, _>) = fingerprints
        .into_iter()
        .map(|((salt, dl_id), fp)| ((salt.clone(), fp), (salt, dl_id)))
        .unzip();

    let sv_clone = sv.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<()> {
            let dis = sv_dis.iter().collect_vec();
            let vw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_clone.id)?;
            let composite_fingerprints = CompositeFingerprint::list(&sv_clone.tenant_id, &dis)
                .into_iter()
                .filter(|cfp| cfp.salts().iter().all(|s| vw.populated_dis().contains(&s.di())))
                .map(|cfp| -> FpResult<_> {
                    // For each Composite FPK that has any DI represented in this data update, generate
                    // the new composite fingerprint out of the pre-computed partial fingerprints
                    let sh_data = cfp.compute(&fps).
                        map_err(Error::MissingFingerprint)?;

                    let lifetime_ids = cfp.salts().into_iter().flat_map(|salt| salt_to_dl_id.get(&salt)).collect_vec();
                    if lifetime_ids.len() != cfp.salts().len() {
                        return Err(AssertionError("Not one lifetime ID for every partial fingerprint").into());
                    }
                    let cfpk = CompositeFingerprintKind::from(&cfp);
                    let d = NewFingerprintArgs {
                        kind: cfpk.into(),
                        data: sh_data.clone().into(),
                        lifetime_ids,
                        scope: cfpk.scope(),
                        version: newtypes::FingerprintVersion::current(),
                        // Denormalized fields
                        scoped_vault_id: &sv_clone.id,
                        vault_id: &sv_clone.vault_id,
                        tenant_id: &sv_clone.tenant_id,
                        is_live: sv_clone.is_live,
                    };
                    Ok((sh_data, d))
                })
                .collect::<FpResult<Vec<_>>>()?;

            // We are susceptible to a race condition... Our partial fingerprints may be stale if the
            // vault data changed since we computed them. This may happen since we cannot lock the
            // vault while computing partial fingerprints.
            // If the partial fingeprints are stale, we've made the arbitrary decision to error.
            for (salt, dl_id) in salt_to_dl_id.iter() {
                let new_dl_id = vw.get_lifetime(&salt.di()).map(|dl| &dl.id);
                if new_dl_id != Some(dl_id) {
                    return Err(ValidationError("Operation aborted due to a concurrent update on this user. Please retry this request").into());
                }
            }

            let sh_datas = composite_fingerprints.iter().map(|(sh_data, _)| sh_data).collect_vec();
            let existing_fps = fingerprint::table
                .filter(fingerprint::vault_id.eq(&sv_clone.vault_id))
                .filter(fingerprint::tenant_id.eq(&sv_clone.tenant_id))
                .filter(fingerprint::is_live.eq(sv_clone.is_live))
                .filter(fingerprint::deactivated_at.is_null())
                .filter(fingerprint::sh_data.is_not_null())
                .filter(fingerprint::sh_data.eq_any(sh_datas))
                .select(fingerprint::sh_data.assume_not_null())
                .get_results::<Fingerprint>(conn.conn())
                .map_err(DbError::from)?;

            // Don't make duplicate composite fingerprints
            let fps = composite_fingerprints.into_iter().filter(|(sh_data, _)| !existing_fps.contains(sh_data)).map(|(_, fp)| fp).collect_vec();
            DbFingerprint::bulk_create(conn, fps)?;
            Ok(())
        })
        .await?;

    let sv_id = sv.id.clone();
    Ok(sv_id)
}
