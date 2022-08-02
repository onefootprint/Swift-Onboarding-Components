use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::IsLive;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::ob_config::ApiObConfig;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::ob_configurations::ObConfiguration;
use newtypes::DataKind;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(tags(Org))]
#[get("/onboarding_configs")]
/// Uses tenant public key auth to return information about the tenant
async fn get(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<Vec<ApiObConfig>>>, ApiError> {
    let is_live = auth.is_live()?;
    let configs = state
        .db_pool
        .db_query(move |conn| ObConfiguration::list_for_tenant(conn, &auth.tenant_id(), is_live))
        .await??;

    Ok(Json(ApiResponseData::ok(
        configs
            .into_iter()
            .map(ApiObConfig::from)
            .collect::<Vec<ApiObConfig>>(),
    )))
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
}

#[api_v2_operation(tags(Org))]
/// Uses tenant public key auth to return information about the tenant
pub fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ApiResponseData<ApiObConfig>>, ApiError> {
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

    Ok(Json(ApiResponseData::ok(ApiObConfig::from(obc))))
}
