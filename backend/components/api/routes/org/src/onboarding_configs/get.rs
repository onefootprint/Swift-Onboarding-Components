use crate::auth::ob_config::ObConfigAuth;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::{
    tenant::{CheckTenantGuard, TenantSessionAuth},
    Either,
};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::CursorPaginatedResponse;
use crate::types::CursorPaginationRequest;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::types::JsonApiResponse;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::DbError;
use newtypes::ObConfigurationId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    tags(Organization, Preview),
    description = " Uses tenant public key auth to return information about the tenant."
)]
#[get("/org/onboarding_config")]
pub fn get_bifrost(
    ob_pk_auth: ObConfigAuth,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((
            ob_pk_auth.ob_config().clone(),
            ob_pk_auth.tenant().clone(),
        )),
    )))
}

#[api_v2_operation(
    tags(Organization, Preview),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs")]
async fn get_list(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<DateTime<Utc>>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> actix_web::Result<
    Json<CursorPaginatedResponse<Vec<api_wire_types::OnboardingConfiguration>, DateTime<Utc>>>,
    ApiError,
> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let cursor = pagination.cursor;
    let page_size = pagination.page_size(&state);

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
    };
    let (configs, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let results = ObConfiguration::list(conn, &query, cursor, (page_size + 1) as i64)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &configs).map(|x| x.created_at);
    let configs = configs
        .into_iter()
        .take(page_size)
        .map(|x| (x, tenant.clone()))
        .map(api_wire_types::OnboardingConfiguration::from_db)
        .collect::<Vec<api_wire_types::OnboardingConfiguration>>();
    Ok(Json(CursorPaginatedResponse::ok(configs, cursor, Some(count))))
}

#[api_v2_operation(
    tags(Organization, Preview),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs/{id}")]
async fn get_detail(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();

    let config = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live)))
        .await??;

    let result = api_wire_types::OnboardingConfiguration::from_db(config);
    ResponseData::ok(result).json()
}
