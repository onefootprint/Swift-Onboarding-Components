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
use api_wire_types::ListUsersRequest;
use db::models::onboarding::Onboarding;
use db::scoped_user::ScopedUserListQueryParams;
use newtypes::DataIdentifier;
use newtypes::FootprintUserId;
use newtypes::IdDocKind;
use newtypes::{Fingerprint, Fingerprinter, IdentityDataKind};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type UserDetailResponse = api_wire_types::User;
type UsersListResponse = Vec<UserDetailResponse>;

/// The UVW util to get_visible_populated_fields() has been updated to only return the more
/// modern DataIdentifiers.
/// This partition map logic converts the modern DataIdentifiers into the legacy IdentityDataKind
/// and IdDocKind. This will be removed when `GET /users` is modernized to return a list of
/// DataIdentifiers
fn get_visible_populated_fields(
    uvw: &TenantUvw,
) -> (
    Vec<DataIdentifier>,
    Vec<IdentityDataKind>,
    Vec<IdDocKind>,
    Vec<IdDocKind>,
) {
    let attributes = uvw.get_visible_populated_fields();
    let mut idks = Vec::<IdentityDataKind>::new();
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

#[api_v2_operation(
    description = "Allows a tenant to view a list of their Onboardings, effectively showing all \
    users that have started the onboarding process for the tenant. Optionally allows filtering on \
    Onboarding status. Requires tenant secret key auth.",
    tags(Users, PublicApi)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ListUsersRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> actix_web::Result<Json<CursorPaginatedResponse<UsersListResponse, i64>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);
    let ListUsersRequest {
        statuses,
        requires_manual_review,
        fingerprint,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    } = filters.into_inner();

    // TODO clean phone number or email
    let fingerprints = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = fingerprint.clean_for_fingerprint();

            let fut_fingerprints = IdentityDataKind::fingerprintable()
                .map(|kind| state.compute_fingerprint(kind, cleaned_data.clone()));
            let fingerprints: Vec<Fingerprint> = futures::future::try_join_all(fut_fingerprints).await?;
            Some(fingerprints)
        }
        None => None,
    };

    let tenant_id = tenant.id.clone();
    let query_params = ScopedUserListQueryParams {
        tenant_id: tenant_id.clone(),
        only_billable: false,
        is_live: auth.is_live()?,
        requires_manual_review,
        statuses,
        fingerprints,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    };
    let (scoped_users, mut obs, uvws, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_users = db::scoped_user::list_authorized_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_user::count_authorized_for_tenant(conn, query_params).map(Some)?;
            let uvws = VaultWrapper::multi_get_for_tenant(conn, scoped_users.clone(), &tenant_id)?;
            let scoped_user_ids: Vec<_> = scoped_users.iter().map(|su| &su.0.id).collect();
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids.clone())?;
            Ok((scoped_users, obs, uvws, count))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = pagination
        .cursor_item(&state, &scoped_users)
        .map(|(su, _)| su.ordering_id);

    let scoped_users = scoped_users
        .into_iter()
        .take(page_size)
        .map(|(su, _)| {
            let uvw = uvws
                .get(&su.id)
                .ok_or_else(|| ApiError::AssertionError("UVW not found".to_owned()))?;
            // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
            let (attributes, identity_data_kinds, document_types, selfie_document_types) =
                get_visible_populated_fields(uvw);
            let is_portable = uvw.user_vault.is_portable;
            let document_types_for_user: Vec<IdentityDocumentKindForUser> =
                create_identity_document_info_for_user(uvw, document_types, selfie_document_types);

            let result = <api_wire_types::User as DbToApi<UserDetail>>::from_db((
                identity_data_kinds,
                document_types_for_user,
                attributes,
                obs.remove(&su.id),
                su,
                is_portable,
            ));
            Ok(result)
        })
        .collect::<ApiResult<_>>()?;

    Ok(Json(CursorPaginatedResponse::ok(scoped_users, cursor, count)))
}

#[api_v2_operation(
    description = "Allows a tenant to view a specific user",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    footprint_user_id: web::Path<FootprintUserId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> actix_web::Result<JsonApiResponse<UserDetailResponse>, ApiError> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let query_params = ScopedUserListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        only_billable: false,
        requires_manual_review: None,
        statuses: vec![],
        fingerprints: None,
        footprint_user_id: Some(footprint_user_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
    };
    let (su, ob, uvw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (su, _) = db::scoped_user::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiError::ResourceNotFound)?;
            let uvw = VaultWrapper::build_for_tenant(conn, &su.id)?;
            let ob = Onboarding::get_for_scoped_users(conn, vec![&su.id])?.remove(&su.id);

            Ok((su, ob, uvw))
        })
        .await??;
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let (attributes, identity_data_kinds, document_types, selfie_document_types) =
        get_visible_populated_fields(&uvw);
    let is_portable = uvw.user_vault.is_portable;
    let document_types_for_user: Vec<IdentityDocumentKindForUser> =
        create_identity_document_info_for_user(&uvw, document_types, selfie_document_types);
    let response = <api_wire_types::User as DbToApi<UserDetail>>::from_db((
        identity_data_kinds,
        document_types_for_user,
        attributes,
        ob,
        su,
        is_portable,
    ));
    Ok(ResponseData::ok(response).json())
}

fn create_identity_document_info_for_user(
    uvw: &TenantUvw,
    document_types: Vec<IdDocKind>,
    selfie_document_types: Vec<IdDocKind>,
) -> Vec<IdentityDocumentKindForUser> {
    uvw.identity_documents()
        .iter()
        .filter(|id_doc_and_req| document_types.contains(&id_doc_and_req.document_type))
        .filter_map(|id_doc_and_req| {
            utils::identity_document::user_facing_status_for_document(&id_doc_and_req.document_request).map(
                |status| {
                    // we could have collected selfie, but user did not authorize it
                    let selfie_collected = utils::identity_document::id_doc_collected_selfie(id_doc_and_req)
                        && selfie_document_types.contains(&id_doc_and_req.document_type);
                    IdentityDocumentKindForUser {
                        kind: id_doc_and_req.document_type,
                        status,
                        selfie_collected,
                    }
                },
            )
        })
        .collect()
}
