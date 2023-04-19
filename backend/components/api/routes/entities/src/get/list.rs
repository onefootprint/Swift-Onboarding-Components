use std::collections::HashMap;

use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::get::EntityListResponse;
use crate::types::response::CursorPaginatedResponse;
use crate::types::CursorPaginationRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::TenantUvw;
use api_wire_types::ListEntitiesRequest;
use db::models::scoped_vault::ScopedVault;
use db::scoped_vault::ScopedVaultListQueryParams;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::{BusinessDataKind as BDK, Fingerprint, Fingerprinter, IdentityDataKind as IDK};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    description = "View list of entities (business or user) that have started onboarding to the tenant.",
    tags(Entities, Preview)
)]
#[get("/entities")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ListEntitiesRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<Json<CursorPaginatedResponse<EntityListResponse, i64>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);
    let ListEntitiesRequest {
        kind,
        statuses,
        requires_manual_review,
        watchlist_hit,
        search,
        timestamp_lte,
        timestamp_gte,
    } = filters.into_inner();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;

    let tenant_id = tenant.id.clone();
    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant_id.clone(),
        only_billable: false,
        is_live: auth.is_live()?,
        requires_manual_review,
        watchlist_hit,
        statuses,
        search,
        fp_id,
        timestamp_lte,
        timestamp_gte,
        kind,
    };
    let (scoped_vaults, mut infos, vws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_vaults = db::scoped_vault::list_authorized_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_vault::count_authorized_for_tenant(conn, query_params).map(Some)?;
            let vws: HashMap<ScopedVaultId, TenantUvw> =
                VaultWrapper::multi_get_for_tenant(conn, scoped_vaults.clone(), &tenant_id, None)?;
            let scoped_vault_ids: Vec<_> = scoped_vaults.iter().map(|su| &su.0.id).collect();
            let infos = ScopedVault::bulk_get_serializable_info(conn, scoped_vault_ids.clone())?;
            Ok((scoped_vaults, infos, vws, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = pagination
        .cursor_item(&state, &scoped_vaults)
        .map(|(sv, _)| sv.ordering_id);

    // Serialize results
    let entities = scoped_vaults
        .into_iter()
        .take(page_size)
        .map(|(sv, _)| {
            // Zip with VW and OB
            let vw = vws
                .get(&sv.id)
                .ok_or_else(|| ApiError::AssertionError("VW not found".to_owned()))?;
            let info = infos.remove(&sv.id);
            Ok((sv, vw, info))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .map(|(sv, vw, info)| api_wire_types::Entity::from_db((sv, vw, info)))
        .collect();
    Ok(Json(CursorPaginatedResponse::ok(entities, cursor, count)))
}

/// Given a search string and fp_id, parse into the list of fingerprints and fp_id by which to query
/// for ScopedVaults
pub async fn parse_search(
    state: &State,
    search: Option<PiiString>,
    tenant_id: &TenantId,
) -> ApiResult<(Option<(PiiString, Vec<Fingerprint>)>, Option<FpId>)> {
    // TODO clean phone number or email
    let Some(search) = search else {
        return Ok((None, None));
    };

    // A bit of a hack: if the user types query that looks like an fp_id, try to look up by identifier instead
    if search.leak().starts_with("fp_id_") || search.leak().starts_with("fp_bid_") {
        let fp_id = Some(FpId::from(search.leak_to_string()));
        Ok((None, fp_id))
    } else {
        let search_str = search.clean_for_fingerprint();
        // Tokenize the search_str string by splitting on `\s`. This handles cases like a user typing in a full name
        let tokenized = search_str
            .clone()
            .leak()
            .split(' ')
            .map(PiiString::from)
            .chain([search_str]) // Re-add the full search_str token
            .collect_vec();
        let fut_fingerprints = tokenized
            .into_iter()
            .map(|s| compute_fingerprint_for_search(state, s, tenant_id));
        let fingerprints = futures::future::try_join_all(fut_fingerprints)
            .await?
            .into_iter()
            .flatten()
            .collect();

        Ok((Some((search, fingerprints)), None))
    }
}

async fn compute_fingerprint_for_search(
    state: &State,
    search: PiiString,
    tenant_id: &TenantId,
) -> Result<Vec<Fingerprint>, ApiError> {
    let searchable_idks = IDK::searchable().into_iter().map(DataIdentifier::from);
    let searchable_bdks = BDK::searchable().into_iter().map(DataIdentifier::from);
    let searchable = searchable_idks
        .chain(searchable_bdks)
        .map(|di| (di, &search))
        .collect::<Vec<_>>();

    state
        .compute_fingerprints_opts(searchable.as_slice(), tenant_id.clone(), true)
        .await
}
