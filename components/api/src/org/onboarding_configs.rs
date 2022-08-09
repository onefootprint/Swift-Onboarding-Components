use crate::auth::key_context::ob_public_key::PublicTenantAuthContext;
use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::IsLive;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::ob_config::ApiObConfig;
use crate::types::response::ApiResponseData;
use crate::types::ApiPaginatedResponseData;
use crate::types::EmptyRequest;
use crate::types::PaginatedRequest;
use crate::State;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configurations::ObConfiguration;
use db::models::ob_configurations::ObConfigurationQuery;
use db::DbError;
use newtypes::ApiKeyStatus;
use newtypes::DataKind;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

#[api_v2_operation(tags(Org))]
#[get("/onboarding_config")]
/// Uses tenant public key auth to return information about the tenant
pub fn get_detail(
    auth: PublicTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<ApiObConfig>>, ApiError> {
    Ok(Json(ApiResponseData::ok(ApiObConfig::from((
        auth.ob_config,
        auth.tenant,
    )))))
}

#[api_v2_operation(tags(Org))]
#[get("/onboarding_configs")]
/// Return a list of onboarding configurations owned by the tenant
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiPaginatedResponseData<Vec<ApiObConfig>, DateTime<Utc>>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let query = ObConfigurationQuery {
        tenant_id: auth.tenant_id(),
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

    let cursor = request.cursor_item(&state, &configs).map(|x| x.created_at);
    let configs = configs
        .into_iter()
        .take(page_size)
        .map(|x| (x, tenant.clone()))
        .map(ApiObConfig::from)
        .collect::<Vec<ApiObConfig>>();
    Ok(Json(ApiPaginatedResponseData::ok(configs, cursor, Some(count))))
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
}

#[api_v2_operation(tags(Org))]
#[post("/onboarding_configs")]
/// Create a new onboarding configuration
pub fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ApiResponseData<ApiObConfig>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data_kinds,
        can_access_data_kinds,
    } = request.into_inner();

    let obc = ObConfiguration::create(
        &state.db_pool,
        name,
        auth.tenant_id(),
        must_collect_data_kinds,
        can_access_data_kinds,
        auth.is_live()?,
    )
    .await?;

    Ok(Json(ApiResponseData::ok(ApiObConfig::from((obc, tenant)))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigPath {
    id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[api_v2_operation(tags(Org))]
#[patch("/onboarding_configs/{id}")]
/// Update an existing onboarding configuration
async fn patch(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    path: web::Path<UpdateObConfigPath>,
    request: web::Json<UpdateObConfigRequest>,
) -> actix_web::Result<Json<ApiResponseData<ApiObConfig>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live()?;
    let UpdateObConfigPath { id } = path.into_inner();
    let UpdateObConfigRequest { name, status } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let result = state
        .db_pool
        .db_transaction(move |conn| ObConfiguration::update(conn, id, tenant_id, is_live, name, status))
        .await?;

    Ok(Json(ApiResponseData::ok(ApiObConfig::from((result, tenant)))))
}
