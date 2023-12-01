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
use api_core::auth::tenant::TenantAuth;
use api_core::errors::AssertionError;
use api_core::types::CursorPaginatedResponseInner;
use api_core::utils::db2api::DbToApi;
use api_core::utils::search_utils::parse_search;
use api_core::utils::vault_wrapper::bulk_decrypt;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::BulkDecryptReq;
use api_core::utils::vault_wrapper::DecryptAccessEventInfo;
use api_core::utils::vault_wrapper::DecryptedData;
use api_core::utils::vault_wrapper::EnclaveDecryptOperation;
use api_core::utils::vault_wrapper::TenantVw;
use api_wire_types::ListEntitiesRequest;
use db::models::scoped_vault::ScopedVault;
use db::scoped_vault::ScopedVaultListQueryParams;
use itertools::Itertools;
use newtypes::CardDataKind;
use newtypes::CardInfo;
use newtypes::CountArgs;
use newtypes::DataIdentifier;
use newtypes::FilterFunction;
use newtypes::IdentityDataKind as IDK;
use newtypes::ScopedVaultId;
use paperclip::actix::{api_v2_operation, get, web};
use std::collections::HashMap;

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
        has_outstanding_workflow_request,
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
        playbook_id: None,
        has_outstanding_workflow_request,
        external_id: None,
    };
    let (scoped_vaults, mut entities, vws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let page_size = (page_size + 1) as i64;
            let (svs, count) =
                db::scoped_vault::list_and_count_authorized_for_tenant(conn, params, cursor, page_size)?;
            let vws: HashMap<ScopedVaultId, TenantVw> =
                VaultWrapper::multi_get_for_tenant(conn, svs.clone(), None)?;
            let scoped_vault_ids: Vec<_> = svs.iter().map(|su| su.0.id.clone()).collect();
            let entities = ScopedVault::bulk_get_serializable_info(conn, scoped_vault_ids)?;
            Ok((svs, entities, vws, count))
        })
        .await??;

    let mut decrypted_results = decrypt_visible_attrs(&state, &auth, vws.values().collect()).await?;

    // Always decrypt name and first letter of last name
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
            let decrypted_data = decrypted_results.remove(&sv.id).unwrap_or_default();
            Ok((vw, entity, decrypted_data))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .map(|(vw, entity, d)| api_wire_types::Entity::from_db((entity, vw, &auth, d)))
        .collect();
    CursorPaginatedResponseInner::ok(entities, cursor, Some(count))
}

/// Decrypt all of the data for the VWs that is visible by default without an explicit request
#[allow(clippy::borrowed_box)]
pub async fn decrypt_visible_attrs(
    state: &State,
    auth: &Box<dyn TenantAuth>,
    vws: Vec<&TenantVw<Any>>,
) -> ApiResult<HashMap<ScopedVaultId, DecryptedData>> {
    let reqs = vws
        .into_iter()
        .map(|vw| {
            let sv_id = vw.scoped_vault.id.clone();
            // Always decrypt card last4
            let card_dis = vw
                .populated_dis()
                .into_iter()
                .filter(|di| {
                    matches!(
                        di,
                        &DataIdentifier::Card(CardInfo {
                            kind: CardDataKind::Last4,
                            ..
                        })
                    )
                })
                .map(|di| di.into())
                .collect_vec();
            // Always decrypt id.first_name and last initial
            let targets = vec![
                EnclaveDecryptOperation::new(IDK::FirstName.into(), vec![]),
                EnclaveDecryptOperation::new(
                    IDK::LastName.into(),
                    vec![FilterFunction::Prefix(CountArgs { count: 1 })],
                ),
            ]
            .into_iter()
            .chain(card_dis)
            // Filter out attributes that can't be decrypted
            .filter(|target| auth.actor_can_decrypt(target.identifier.clone()))
            .filter(|target| vw.tenant_can_decrypt(target.identifier.clone()))
            .collect();

            let req = BulkDecryptReq { vw, targets };
            (sv_id, req)
        })
        .collect();
    // TODO it's strange we don't make an access event here, but we would if you requested to
    // decrypt it
    let access_event = DecryptAccessEventInfo::NoAccessEvent;
    let decrypted_results = bulk_decrypt(state, reqs, access_event)
        .await?
        .into_iter()
        .collect::<HashMap<_, _>>();
    Ok(decrypted_results)
}
