use std::collections::HashMap;

use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    get,
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    decision::vendor::neuro_id::tenant_can_view_neuro,
    errors::ApiResult,
    utils::{
        db2api::DbToApi,
        fp_id_path::FpIdPath,
        vault_wrapper::{TenantVw, VaultWrapper},
    },
};
use db::models::{
    fingerprint::Fingerprint, neuro_id_analytics_event::NeuroIdAnalyticsEvent, scoped_vault::ScopedVault,
};
use itertools::{chain, Itertools};
use newtypes::{DupeKind, ScopedVaultId};
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Lists information about other vaults with duplicate information for a footprint vault.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/dupes")]
pub async fn get_dupes(
    state: web::Data<State>,
    request: FpIdPath,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::Dupes> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let can_view_neuro = tenant_can_view_neuro(&state, &tenant_id);

    let (dupes, vws, neuro_dupes) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            // Load the dupes
            let dupes = Fingerprint::get_dupes(conn, &sv)?;
            let neuro_dupes = NeuroIdAnalyticsEvent::get_dupes_for_tenant(conn, &sv)?;

            // Get VWs for all the dupes
            let sv_ids = chain(
                dupes.internal.iter().map(|fp| &fp.scoped_vault_id),
                neuro_dupes.internal.iter().map(|(_, sv_id)| sv_id),
            )
            .collect_vec();
            let vaults = ScopedVault::bulk_get(conn, sv_ids, &tenant_id, is_live)?;
            let vws: HashMap<ScopedVaultId, TenantVw> =
                VaultWrapper::multi_get_for_tenant(conn, vaults, None)?;


            Ok((dupes, vws, neuro_dupes))
        })
        .await?;

    let mut decrypted_results =
        get::search::decrypt_visible_attrs(&state, &auth, vws.values().collect()).await?;
    let mut sv_id_to_dupe_fps = dupes
        .internal
        .into_iter()
        .map(|fp| (fp.scoped_vault_id, fp.kind))
        .into_group_map();
    let mut sv_id_to_dupe_neuro = neuro_dupes
        .internal
        .into_iter()
        .map(|(kind, sv)| (sv, kind))
        .into_group_map();

    let same_tenant = vws
        .into_iter()
        .map(|(sv_id, vw)| {
            let decrypted_data = decrypted_results.remove(&sv_id).unwrap_or_default();
            let duplicate_dis = sv_id_to_dupe_fps.remove(&sv_id).unwrap_or_default();
            let duplicate_neuro_kinds = if can_view_neuro {
                sv_id_to_dupe_neuro.remove(&sv_id).unwrap_or_default()
            } else {
                vec![]
            };

            let duplicate_kinds = chain(
                duplicate_dis
                    .into_iter()
                    .map(DupeKind::try_from)
                    .collect::<newtypes::NtResult<Vec<_>>>()?,
                duplicate_neuro_kinds,
            )
            .unique()
            .collect_vec();
            Ok((duplicate_kinds, vw, decrypted_data))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        // don't return dupes if there are no dupe kinds
        .filter(|(d, _, _)| !d.is_empty())
        .map(|(d, vw, data)| api_wire_types::SameTenantDupe::from_db((d, vw, &auth, data)))
        .collect();

    let other_tenant = dupes.external.map(|d| api_wire_types::OtherTenantDupes {
        num_matches: d.num_users,
        num_tenants: d.num_tenants,
    });
    let response = api_wire_types::Dupes {
        same_tenant,
        other_tenant,
    };
    ResponseData::ok(response).json()
}
