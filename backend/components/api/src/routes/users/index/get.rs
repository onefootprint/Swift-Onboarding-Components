use std::collections::HashMap;

use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantPermission;
use crate::auth::tenant::TenantUserAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::serializers::UserDetail;
use crate::types::request::PaginatedRequest;
use crate::types::response::PaginatedResponseData;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use api_wire_types::ListUsersRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::scoped_user::OnboardingListQueryParams;
use newtypes::FootprintUserId;
use newtypes::{DataLifetimeKind, Fingerprint, Fingerprinter};
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type UsersDetailResponse = api_wire_types::User;
type UsersListResponse = Vec<UsersDetailResponse>;

#[api_v2_operation(
    description = "Allows a tenant to view a list of their Onboardings, effectively showing all \
    users that have started the onboarding process for the tenant. Optionally allows filtering on \
    Onboarding status. Requires tenant secret key auth.",
    tags(Users, PublicApi)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<ListUsersRequest, i64>>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<PaginatedResponseData<UsersListResponse, i64>>, ApiError> {
    let auth = auth.check_permissions(TenantPermission::Users)?;
    let tenant = auth.tenant();

    let cursor = request.cursor;
    let page_size = request.page_size(&state);
    let ListUsersRequest {
        statuses,
        requires_manual_review,
        fingerprint,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    } = request.data.clone();

    // TODO clean phone number or email
    let fingerprints = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = fingerprint.clean_for_fingerprint();

            let fut_fingerprints = DataLifetimeKind::fingerprintable()
                .map(|kind| state.compute_fingerprint(kind, cleaned_data.clone()));
            let fingerprints: Vec<Fingerprint> = futures::future::try_join_all(fut_fingerprints).await?;
            Some(fingerprints)
        }
        None => None,
    };

    let tenant_id = tenant.id.clone();
    let query_params = OnboardingListQueryParams {
        tenant_id: tenant_id.clone(),
        is_live: auth.is_live()?,
        requires_manual_review,
        statuses,
        fingerprints,
        footprint_user_id,
        timestamp_lte,
        timestamp_gte,
    };
    let (scoped_users, mut obs, uvws, count, ob_config_map) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_users = db::scoped_user::list_authorized_for_tenant(
                conn,
                query_params.clone(),
                cursor,
                (page_size + 1) as i64,
            )?;
            let count = db::scoped_user::count_authorized_for_tenant(conn, query_params).map(Some)?;
            let uvws: Vec<UserVaultWrapper> =
                UserVaultWrapper::multi_get_for_tenant(conn, scoped_users.clone(), &tenant_id)?;
            let scoped_user_ids: Vec<_> = scoped_users.iter().map(|su| &su.0.id).collect();
            let obs = Onboarding::get_for_scoped_users(conn, scoped_user_ids.clone())?;
            let ob_config_map = ObConfiguration::list_authorized_for_users(conn, scoped_user_ids)?;

            Ok((scoped_users, obs, uvws, count, ob_config_map))
        })
        .await??;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = request
        .cursor_item(&state, &scoped_users)
        .map(|(su, _)| su.ordering_id);

    let uvw_map: HashMap<_, _> = uvws
        .into_iter()
        // scoped_user_id should be non-null for all of these
        .flat_map(|uvw| (uvw.scoped_user_id().cloned().map(move |su_id| (su_id, uvw))))
        .collect();

    let scoped_users = scoped_users
        .into_iter()
        .take(page_size)
        .map(|(su, _)| {
            let uvw = uvw_map
                .get(&su.id)
                .ok_or_else(|| ApiError::AssertionError("UVW not found".to_owned()))?;
            let ob_configs = ob_config_map
                .get(&su.id)
                .ok_or_else(|| ApiError::AssertionError("Ob config not found".to_owned()))?;
            // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
            let (data_attributes, document_types) = uvw.get_accessible_populated_fields(ob_configs);
            let result = <api_wire_types::User as DbToApi<UserDetail>>::from_db((
                data_attributes,
                document_types,
                obs.remove(&su.id),
                su,
                uvw.user_vault.is_portable,
            ));
            Ok(result)
        })
        .collect::<ApiResult<_>>()?;

    Ok(Json(PaginatedResponseData::ok(scoped_users, cursor, count)))
}

#[api_v2_operation(
    description = "Allows a tenant to view a specific user",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    footprint_user_id: web::Path<FootprintUserId>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<JsonApiResponse<UsersDetailResponse>, ApiError> {
    let auth = auth.check_permissions(TenantPermission::Users)?;
    let tenant = auth.tenant();

    let query_params = OnboardingListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
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
            let uvw = UserVaultWrapper::build_for_tenant(conn, &su.id)?;
            let ob = Onboarding::get_for_scoped_users(conn, vec![&su.id])?
                .remove(&su.id)
                .ok_or(ApiError::ResourceNotFound)?;

            Ok((su, ob, uvw))
        })
        .await??;
    let (_, ob_config, _, _, _, _) = &ob;
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let (data_attributes, document_types) = uvw.get_accessible_populated_fields(&[ob_config.clone()]);

    let response = <api_wire_types::User as DbToApi<UserDetail>>::from_db((
        data_attributes,
        document_types,
        Some(ob),
        su,
        uvw.user_vault.is_portable,
    ));
    Ok(ResponseData::ok(response).json())
}
