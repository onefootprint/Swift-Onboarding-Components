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
use api_core::auth::user::UserObAuthContext;
use api_core::auth::Any;
use api_core::types::JsonApiResponse;
use api_wire_types::OnboardingConfigFilters;
use chrono::DateTime;
use chrono::Utc;
use db::models::appearance::Appearance;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::DbError;
use newtypes::ObConfigurationId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    tags(Organization, Private),
    description = " Uses tenant public key auth to return information about the tenant."
)]
#[get("/org/onboarding_config")]
pub fn get_bifrost(
    state: web::Data<State>,
    auth: Either<ObConfigAuth, UserObAuthContext>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let (tenant, ob_config) = match auth {
        Either::Left(ob_pk_auth) => {
            // Support auth that identifies an ob config
            let tenant = ob_pk_auth.tenant().clone();
            let ob_config = ob_pk_auth.ob_config().clone();
            (tenant, ob_config)
        }
        Either::Right(user_ob_auth) => {
            // Also take in a user auth token that has the onboarding scope that identifies an ob
            // config
            let user_ob_auth = user_ob_auth.check_guard(Any)?;
            let ob_config = user_ob_auth.data.ob_config()?.clone();
            let tenant = user_ob_auth.data.tenant()?.clone();
            (tenant, ob_config)
        }
    };
    let tenant_id = tenant.id.clone();
    let appearance_id = ob_config.appearance_id.clone();
    let appearance = if let Some(appearance_id) = appearance_id {
        let appearance = state
            .db_pool
            .db_query(move |conn| Appearance::get(conn, &appearance_id, &tenant_id))
            .await??;
        Some(appearance)
    } else {
        None
    };
    let ff_client = state.feature_flag_client.clone();
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((ob_config, tenant, appearance, ff_client)),
    )))
}

#[api_v2_operation(
    tags(Organization, Private),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs")]
async fn get_list(
    state: web::Data<State>,
    filters: web::Query<OnboardingConfigFilters>,
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

    let OnboardingConfigFilters { status } = filters.into_inner();

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        status,
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
    let ff_client = state.feature_flag_client.clone();
    let configs = configs
        .into_iter()
        .take(page_size)
        .map(|obc| {
            api_wire_types::OnboardingConfiguration::from_db((obc, tenant.clone(), None, ff_client.clone()))
        })
        .collect::<Vec<api_wire_types::OnboardingConfiguration>>();
    Ok(Json(CursorPaginatedResponse::ok(configs, cursor, Some(count))))
}

#[api_v2_operation(
    tags(Organization, Private),
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

    let (obc, tenant) = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live)))
        .await??;

    let ff_client = state.feature_flag_client.clone();
    let result = api_wire_types::OnboardingConfiguration::from_db((obc, tenant, None, ff_client));
    ResponseData::ok(result).json()
}
