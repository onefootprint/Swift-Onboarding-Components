use std::collections::HashMap;

use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::get::EntityListResponse;
use crate::types::response::CursorPaginatedResponse;
use crate::types::CursorPaginationRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::errors::AssertionError;
use api_core::types::CursorPaginatedResponseInner;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::TenantVw;
use api_wire_types::ListEntitiesRequest;
use db::models::scoped_vault::ScopedVault;
use db::scoped_vault::ScopedVaultListQueryParams;
use itertools::Itertools;
use newtypes::fingerprinter::FingerprintScope;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::FpId;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::{BusinessDataKind as BDK, Fingerprint, Fingerprinter, IdentityDataKind as IDK};
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View list of entities (business or user) that have started onboarding to the tenant.",
    tags(Entities, Private)
)]
#[get("/entities")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ListEntitiesRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: TenantSessionAuth,
) -> CursorPaginatedResponse<EntityListResponse, i64> {
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
        show_all,
        is_created_via_api,
    } = filters.into_inner();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;

    let tenant_id = tenant.id.clone();
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant_id.clone(),
        is_live: auth.is_live()?,
        requires_manual_review,
        watchlist_hit,
        statuses,
        search,
        fp_id,
        timestamp_lte,
        timestamp_gte,
        kind,
        only_visible: !show_all.unwrap_or_default(),
        is_created_via_api,
    };
    let (scoped_vaults, mut entities, vws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let page_size = (page_size + 1) as i64;
            let (svs, count) =
                db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, cursor, page_size)?;
            let vws: HashMap<ScopedVaultId, TenantVw> =
                VaultWrapper::multi_get_for_tenant(conn, svs.clone(), &tenant_id, None)?;
            let scoped_vault_ids: Vec<_> = svs.iter().map(|su| su.0.id.clone()).collect();
            let entities = ScopedVault::bulk_get_serializable_info(conn, scoped_vault_ids)?;
            Ok((svs, entities, vws, count))
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
            let vw = vws.get(&sv.id).ok_or(AssertionError("VW not found"))?;
            let entity = entities
                .remove(&sv.id)
                .ok_or(AssertionError("Entity info not found"))?;
            Ok((vw, entity))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .map(|(vw, entity)| api_wire_types::Entity::from_db((entity, vw, &auth)))
        .collect();
    CursorPaginatedResponseInner::ok(entities, cursor, Some(count))
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
        // See if the search string is a phone number and format it properly for fingerprinting
        let formatted_phone_numbers = vec![
            PiiString::new(format!("+1{}", search_str.leak())),
            search_str.clone(),
        ]
        .into_iter()
        .filter_map(|p| PhoneNumber::parse(p).ok().map(|p| p.e164()));
        // Tokenize the search_str string by splitting on `\s`. This handles cases like a user typing in a full name
        let tokenized = search_str
            .clone()
            .leak()
            .split(' ')
            .map(PiiString::from)
            .chain([search_str]) // Re-add the full search_str token
            .chain(formatted_phone_numbers) // Add formatted phone numbers
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
) -> ApiResult<Vec<Fingerprint>> {
    let searchable_idks = IDK::searchable().into_iter().map(DataIdentifier::from);
    let searchable_bdks = BDK::searchable().into_iter().map(DataIdentifier::from);
    let data = searchable_idks
        .chain(searchable_bdks)
        .map(|di| (di, &search))
        .collect_vec();

    let tenant_scoped = data
        .iter()
        .map(|(di, pii)| ((), FingerprintScope::Tenant(di, tenant_id), *pii))
        .collect_vec();
    let global = data
        .iter()
        .filter_map(|(di, pii)| {
            GlobalFingerprintKind::try_from(di.clone())
                .ok()
                .map(|gdi| (gdi, pii))
        })
        .map(|(gdi, pii)| ((), FingerprintScope::Global(gdi), *pii))
        .collect_vec();
    let data = tenant_scoped.into_iter().chain(global).collect_vec();

    let fps = state
        .compute_fingerprints(data)
        .await?
        .into_iter()
        .map(|(_, fp)| fp)
        .collect();
    Ok(fps)
}
