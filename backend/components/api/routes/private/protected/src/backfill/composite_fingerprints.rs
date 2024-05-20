use crate::{
    backfill::{BackfillRequest, BackfillResponse},
    ProtectedAuth,
};
use actix_web::{post, web, web::Json};
use api_core::{
    errors::{ApiResult, AssertionError, DryRunError, DryRunResult, DryRunResultTrait, ValidationError},
    types::{JsonApiResponse, ResponseData},
    utils::vault_wrapper::{Any, TenantVw, VaultWrapper},
    State,
};
use db::{
    models::fingerprint::{Fingerprint as DbFingerprint, NewFingerprintArgs},
    DbError,
};
use db_schema::schema::fingerprint;
use diesel::{prelude::*, QueryDsl};
use futures::StreamExt;
use itertools::Itertools;
use newtypes::{
    CompositeFingerprint, CompositeFingerprintKind, Fingerprint, FingerprintKind, IdentityDataKind as IDK,
    MissingFingerprint, ScopedVaultId,
};
use std::collections::HashMap;


// I've manually created this table with the list of SVs that need to be backfilled, as an
// optimization so we don't have to iterate through every SV.
diesel::table! {
    use diesel::sql_types::*;

    svs_to_backfill (scoped_vault_id) {
        scoped_vault_id -> Text,
    }
}

#[post("/private/backfill/composite_fingerprints")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BackfillRequest<ScopedVaultId>>,
    _: ProtectedAuth,
) -> JsonApiResponse<BackfillResponse<Vec<ScopedVaultId>, ScopedVaultId>> {
    let BackfillRequest {
        dry_run,
        limit,
        concurrency,
        cursor,
        shard_config,
    } = request.into_inner();

    let (sv_ids, cursor) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv_ids = svs_to_backfill::table
                .filter(svs_to_backfill::scoped_vault_id.gt(cursor))
                .limit(limit)
                .select(svs_to_backfill::scoped_vault_id)
                .order_by(svs_to_backfill::scoped_vault_id)
                .get_results::<ScopedVaultId>(conn)
                .map_err(DbError::from)?;
            let cursor = sv_ids.last().cloned();
            Ok((sv_ids, cursor))
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
        .map(|sv_id| backfill_composite_fingerprints(&state, sv_id, dry_run))
        .collect_vec();
    let futs = futures::stream::iter(vws_fut).buffer_unordered(concurrency);
    let data = futs
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<ApiResult<Vec<_>>>()?;


    let response = BackfillResponse { data, cursor };
    ResponseData::ok(response).json()
}

#[tracing::instrument(skip_all)]
async fn backfill_composite_fingerprints(
    state: &State,
    sv_id: ScopedVaultId,
    dry_run: bool,
) -> ApiResult<ScopedVaultId> {
    let vw: TenantVw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
        .await?;
    let sv = vw.scoped_vault.clone();
    let sv_id = sv.id.clone();
    let tenant_id = &vw.scoped_vault.tenant_id;
    let dis = &[IDK::FirstName.into(), IDK::LastName.into(), IDK::Dob.into()];
    let dis = dis.iter().collect_vec();
    let (fps, salt_to_dl_id) = vw.fingerprint_ciphertext(state, dis, tenant_id).await?;
    let fps: HashMap<_, _> = fps.into_iter().collect();

    let result = state
        .db_pool
        .db_transaction(move |conn| -> DryRunResult<_> {
            let vw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv.id)?;

            let composite_fingerprints = CompositeFingerprint::list(&sv.tenant_id)
                .into_iter()
                .filter(|cfp| cfp.salts().iter().all(|s| vw.populated_dis().contains(&s.di())))
                .map(|cfp| -> ApiResult<_> {
                    // For each Composite FPK that has any DI represented in this data update, generate
                    // the new composite fingerprint out of the pre-computed partial fingerprints
                    let sh_data = match cfp.compute(&fps) {
                        Ok(sh_data) => sh_data,
                        Err(MissingFingerprint(salt)) => {
                            return AssertionError(&format!("Missing fingerprint {:?}", salt)).into();
                        }
                    };

                    let lifetime_ids = cfp.salts().into_iter().flat_map(|salt| salt_to_dl_id.get(&salt)).collect_vec();
                    if lifetime_ids.len() != cfp.salts().len() {
                        return AssertionError("Not one lifetime ID for every partial fingerprint").into();
                    }
                    let cfpk = CompositeFingerprintKind::from(&cfp);
                    let d = NewFingerprintArgs {
                        kind: cfpk.into(),
                        data: sh_data.clone().into(),
                        lifetime_ids,
                        scope: cfpk.scope(),
                        version: newtypes::FingerprintVersion::current(),
                        // Denormalized fields
                        scoped_vault_id: &sv.id,
                        vault_id: &sv.vault_id,
                        tenant_id: &sv.tenant_id,
                        is_live: sv.is_live,
                    };
                    Ok((sh_data, d))
                })
                .collect::<ApiResult<Vec<_>>>()?;

            // We are susceptible to a race condition... Our partial fingerprints may be stale if the
            // vault data changed since we computed them. This may happen since we cannot lock the
            // vault while computing partial fingerprints.
            // If the partial fingeprints are stale, we've made the arbitrary decision to error.
            for (salt, dl_id) in salt_to_dl_id.iter() {
                let new_dl_id = vw.get_lifetime(&salt.di()).map(|dl| &dl.id);
                if new_dl_id != Some(dl_id) {
                    return DryRunResult::Err(DryRunError::Err(ValidationError(
                        "Operation aborted due to a concurrent update on this user. Please retry this request",
                    )
                    .into()));
                }
            }

            let sh_datas = composite_fingerprints.iter().map(|(sh_data, _)| sh_data).collect_vec();
            let existing_fps = fingerprint::table
                .filter(fingerprint::vault_id.eq(&sv.vault_id))
                .filter(fingerprint::tenant_id.eq(&sv.tenant_id))
                .filter(fingerprint::is_live.eq(sv.is_live))
                .filter(fingerprint::deactivated_at.is_null())
                .filter(fingerprint::sh_data.is_not_null())
                .filter(fingerprint::sh_data.eq_any(sh_datas))
                .select(fingerprint::sh_data.assume_not_null())
                .get_results::<Fingerprint>(conn.conn())?;

            // Don't make duplicate composite fingerprints
            let fps = composite_fingerprints.into_iter().filter(|(sh_data, _)| !existing_fps.contains(sh_data)).map(|(_, fp)| fp).collect_vec();

            DbFingerprint::bulk_create(conn, fps)?;

            // Make sure the user has composite fingerprints
            let existing_fps = fingerprint::table
                .filter(fingerprint::vault_id.eq(&sv.vault_id))
                .filter(fingerprint::tenant_id.eq(&sv.tenant_id))
                .filter(fingerprint::is_live.eq(sv.is_live))
                .filter(fingerprint::deactivated_at.is_null())
                .filter(fingerprint::sh_data.is_not_null())
                .select(fingerprint::kind)
                .get_results::<FingerprintKind>(conn.conn())?;
            if !existing_fps.iter().any(|fp| matches!(fp, FingerprintKind::Composite(_))) {
                return DryRunResult::Err(DryRunError::Err(AssertionError(&format!("User has no composite fingerprints {}", sv.id)).into()));
            }

            DryRunResult::ok_or_rollback((), dry_run)
        })
        .await;

    result.value()?;

    Ok(sv_id)
}
