use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::CursorPaginatedResponse;
use api_core::types::CursorPaginationRequest;
use api_core::utils::actix::OptionalJson;
use api_core::utils::vault_wrapper::Any;
use api_route_entities::parse_search;
use api_wire_types::SearchUsersRequest;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::scoped_vault::ScopedVaultListQueryParams;
use itertools::Itertools;
use newtypes::put_data_request::RawDataRequest;
use newtypes::AccessEventKind;
use newtypes::ValidateArgs;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json};

#[api_v2_operation(
    description = "Creates a new user vault, optionally initializing with the provided data",
    tags(Users, Vault, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<api_wire_types::User>>, ApiError> {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let principal = auth.actor().into();
    let insight = CreateInsightEvent::from(insight);

    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let new_user = NewVaultArgs {
        public_key,
        e_private_key,
        is_live,
        is_portable: false,
        kind: VaultKind::Person,
    };

    // Parse optional request
    let request_info = if let Some(request) = request.into_inner() {
        let targets = request.keys().cloned().collect_vec();
        if !targets.is_empty() {
            let request = request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
            let request = request
                .build_tenant_fingerprints(state.as_ref(), &tenant_id)
                .await?;
            Some((targets, request))
        } else {
            None
        }
    } else {
        None
    };

    let scoped_user = state
        .db_pool
        .db_transaction(|conn| -> ApiResult<_> {
            let user_vault = Vault::create(conn, new_user)?;
            let scoped_user = ScopedVault::create_non_portable(conn, user_vault, tenant_id)?;

            if let Some((targets, request)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &scoped_user.id)?;
                uvw.patch_data(conn, request)?;
                // Create an access event to show data was added
                NewAccessEvent {
                    scoped_vault_id: scoped_user.id.clone(),
                    reason: None,
                    principal,
                    insight,
                    kind: AccessEventKind::Update,
                    targets,
                }
                .create(conn)?;
            }

            Ok(scoped_user)
        })
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::User::from_db(scoped_user))))
}

#[api_v2_operation(
    description = "Get a list of users, optionally searching by fingerprint",
    tags(Users, Preview)
)]
#[get("/users")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    request: web::Query<SearchUsersRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<Json<CursorPaginatedResponse<Vec<api_wire_types::User>, i64>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let SearchUsersRequest { search } = request.into_inner();

    let (search, fp_id) = parse_search(&state, search, &tenant.id).await?;
    let params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        only_billable: false,
        is_live: auth.is_live()?,
        search,
        fp_id,
        kind: Some(VaultKind::Person),
        ..ScopedVaultListQueryParams::default()
    };
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

    let (svs, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let count = db::scoped_vault::count_authorized_for_tenant(conn, params.clone()).map(Some)?;
            let svs =
                db::scoped_vault::list_authorized_for_tenant(conn, params, cursor, (page_size + 1) as i64)?;
            Ok((svs, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &svs).map(|(sv, _)| sv.ordering_id);

    let results = svs
        .into_iter()
        .map(|(sv, _)| api_wire_types::User::from_db(sv))
        .collect();
    Ok(Json(CursorPaginatedResponse::ok(results, cursor, count)))
}
