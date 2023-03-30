use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::serializers::UserDetail;
use crate::types::response::CursorPaginatedResponse;
use crate::types::CursorPaginationRequest;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::TenantUvw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_wire_types::IdentityDocumentKindForUser;
use api_wire_types::ListEntitiesRequest;
use api_wire_types::ListUsersRequest;
use db::models::onboarding::Onboarding;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::DataIdentifier;
use newtypes::FootprintUserId;
use newtypes::IdDocKind;
use newtypes::PiiString;
use newtypes::VaultKind;
use newtypes::{BusinessDataKind as BDK, Fingerprint, Fingerprinter, IdentityDataKind as IDK};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

pub type EntityDetailResponse = api_wire_types::Entity;
pub type EntityListResponse = Vec<EntityDetailResponse>;

/// The UVW util to get_visible_populated_fields() has been updated to only return the more
/// modern DataIdentifiers.
/// This partition map logic converts the modern DataIdentifiers into the legacy IdentityDataKind
/// and IdDocKind. This will be removed when `GET /users` is modernized to return a list of
/// DataIdentifiers
fn get_visible_populated_fields(
    vw: &TenantUvw,
) -> (Vec<DataIdentifier>, Vec<IDK>, Vec<IdDocKind>, Vec<IdDocKind>) {
    let attributes = vw.get_visible_populated_fields();
    let mut idks = Vec::<IDK>::new();
    let mut docs = Vec::<IdDocKind>::new();
    let mut selfies = Vec::<IdDocKind>::new();
    attributes.iter().cloned().for_each(|di| match di {
        DataIdentifier::Id(idk) => idks.push(idk),
        DataIdentifier::IdDocument(doc_kind) => docs.push(doc_kind),
        DataIdentifier::Selfie(doc_kind) => selfies.push(doc_kind),
        _ => (),
    });

    (attributes, idks, docs, selfies)
}

fn create_identity_document_info_for_user(
    vw: &TenantUvw,
    document_types: Vec<IdDocKind>,
    selfie_document_types: Vec<IdDocKind>,
) -> Vec<IdentityDocumentKindForUser> {
    vw.identity_documents()
        .iter()
        .filter(|id_doc_and_req| document_types.contains(&id_doc_and_req.document_type))
        .filter_map(|id_doc_and_req| {
            utils::identity_document::user_facing_status_for_document(&id_doc_and_req.document_request).map(
                |status| {
                    // we could have collected selfie, but user did not authorize it
                    let selfie_collected = utils::identity_document::id_doc_collected_selfie(id_doc_and_req)
                        && selfie_document_types.contains(&id_doc_and_req.document_type);
                    IdentityDocumentKindForUser {
                        // Supporting this for backwards compatibility
                        kind: id_doc_and_req.document_type,
                        // Provide fully-fledged identifier to the frontend
                        data_identifier: DataIdentifier::IdDocument(id_doc_and_req.document_type),
                        status,
                        selfie_collected,
                    }
                },
            )
        })
        .collect()
}

pub async fn get_entities<T>(
    state: web::Data<State>,
    filters: web::Query<ListUsersRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    vault_kind: Option<VaultKind>,
) -> ApiResult<Json<CursorPaginatedResponse<Vec<T>, i64>>>
where
    T: DbToApi<UserDetail>,
{
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);
    let ListUsersRequest {
        statuses,
        requires_manual_review,
        search,
        footprint_user_id: mut fp_id,
        timestamp_lte,
        timestamp_gte,
    } = filters.into_inner();

    // TODO clean phone number or email
    let fingerprints = if let Some(search) = search {
        // Tokenize the search string by splitting on `\s`. This handles cases like a user typing in a full name
        let cleaned_data = tokenize_search_query(search.clean_for_fingerprint());

        // A bit of a hack: if the user types query that looks like an fp_id, try to look up by identifier instead
        if cleaned_data.iter().any(|p| p.leak().starts_with("fp_id_")) && fp_id.is_none() {
            fp_id = Some(FootprintUserId::from(search.leak_to_string()));
            None
        } else {
            let fut_fingerprints = cleaned_data
                .into_iter()
                .map(|s| compute_fingerprint_for_search(&state, s));
            let fingerprints = futures::future::try_join_all(fut_fingerprints)
                .await?
                .into_iter()
                .flatten()
                .collect();

            Some(fingerprints)
        }
    } else {
        None
    };

    let tenant_id = tenant.id.clone();
    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant_id.clone(),
        only_billable: false,
        is_live: auth.is_live()?,
        requires_manual_review,
        statuses,
        fingerprints,
        fp_user_id: fp_id,
        timestamp_lte,
        timestamp_gte,
        kind: vault_kind,
    };
    let (scoped_vaults, mut obs, vws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_users = db::scoped_vault::list_authorized_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_vault::count_authorized_for_tenant(conn, query_params).map(Some)?;
            let vws = VaultWrapper::multi_get_for_tenant(conn, scoped_users.clone(), &tenant_id)?;
            let scoped_user_ids: Vec<_> = scoped_users.iter().map(|su| &su.0.id).collect();
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids.clone())?;
            Ok((scoped_users, obs, vws, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = pagination
        .cursor_item(&state, &scoped_vaults)
        .map(|(sv, _)| sv.ordering_id);

    let scoped_vaults = scoped_vaults
        .into_iter()
        .take(page_size)
        .map(|(sv, _)| {
            let vw = vws
                .get(&sv.id)
                .ok_or_else(|| ApiError::AssertionError("VW not found".to_owned()))?;
            // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
            let ob = obs.remove(&sv.id);
            let (attributes, idks, document_types, selfie_document_types) = get_visible_populated_fields(vw);
            let is_portable = vw.vault.is_portable;
            let doc_types: Vec<IdentityDocumentKindForUser> =
                create_identity_document_info_for_user(vw, document_types, selfie_document_types);
            let result = T::from_db((idks, doc_types, attributes, ob, sv, is_portable, vw.vault().kind));
            Ok(result)
        })
        .collect::<ApiResult<_>>()?;

    Ok(Json(CursorPaginatedResponse::ok(scoped_vaults, cursor, count)))
}

#[api_v2_operation(
    description = "View list of entities (business or user) that have started onboarding to the tenant.",
    tags(Entities, Private)
)]
#[get("/entities")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ListUsersRequest>,
    entities_filters: web::Query<ListEntitiesRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<Json<CursorPaginatedResponse<EntityListResponse, i64>>> {
    let ListEntitiesRequest { kind } = entities_filters.into_inner();
    let result = get_entities(state, filters, pagination, auth, kind).await?;
    Ok(result)
}

pub async fn get_entity<T>(
    state: web::Data<State>,
    fp_id: web::Path<FootprintUserId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<T>
where
    T: DbToApi<UserDetail>,
{
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        only_billable: false,
        requires_manual_review: None,
        statuses: vec![],
        fingerprints: None,
        fp_user_id: Some(fp_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
        kind: None,
    };
    let (su, ob, vw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (su, _) = db::scoped_vault::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiError::ResourceNotFound)?;
            let vw = VaultWrapper::build_for_tenant(conn, &su.id)?;
            let ob = Onboarding::get_for_scoped_users(conn, vec![&su.id])?.remove(&su.id);

            Ok((su, ob, vw))
        })
        .await??;
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let (attributes, idks, document_types, selfie_document_types) = get_visible_populated_fields(&vw);
    let is_portable = vw.vault.is_portable;
    let doc_types: Vec<IdentityDocumentKindForUser> =
        create_identity_document_info_for_user(&vw, document_types, selfie_document_types);
    let result = T::from_db((idks, doc_types, attributes, ob, su, is_portable, vw.vault().kind));
    ResponseData::ok(result).json()
}

#[api_v2_operation(
    description = "View details of a specific entity (business or user)",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    fp_id: web::Path<FootprintUserId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<EntityDetailResponse> {
    let result = get_entity(state, fp_id, auth).await?;
    Ok(result)
}

async fn compute_fingerprint_for_search(
    state: &State,
    search: PiiString,
) -> Result<Vec<Fingerprint>, ApiError> {
    let searchable_idks = IDK::searchable().into_iter().map(DataIdentifier::from);
    let searchable_bdks = BDK::searchable().into_iter().map(DataIdentifier::from);
    let searchable = searchable_idks.chain(searchable_bdks);
    let fut_fingerprints = searchable.map(|kind| state.compute_fingerprint(kind, search.clone()));
    let fingerprints = futures::future::try_join_all(fut_fingerprints).await?;

    Ok(fingerprints)
}

fn tokenize_search_query(input: PiiString) -> Vec<PiiString> {
    let mut tokenized: Vec<PiiString> = input.leak().split(' ').map(PiiString::from).collect();
    // Add back in the original term, since addresses were probably fingerprinted with spaces in them to begin withs
    tokenized.push(input);

    tokenized
}
