use crate::auth::either::Either;
use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_context::{HasTenant, SessionContext};
use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::auth::IsLive;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::key_context::ob_public_key::PublicTenantAuthContext, errors::ApiError};
use db::models::ob_configurations::NewObConfiguration;
use newtypes::{DataKind, ObConfigurationId, ObConfigurationKey, ObConfigurationSettings};
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct PublicOnboardingConfigResponse {
    org_name: String,
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    settings: ObConfigurationSettings,
    is_live: bool,
}

#[api_v2_operation(tags(Org))]
#[get("/config")]
/// Uses tenant public key auth to return information about the tenant
fn get(
    _state: web::Data<State>,
    auth: PublicTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<PublicOnboardingConfigResponse>>, ApiError> {
    let tenant = auth.tenant;
    let ob_config = auth.ob_config;

    Ok(Json(ApiResponseData {
        data: PublicOnboardingConfigResponse {
            org_name: tenant.name,
            name: ob_config.name,
            must_collect_data_kinds: ob_config.must_collect_data_kinds.clone(),
            can_access_data_kinds: ob_config.can_access_data_kinds,
            settings: ob_config.settings,
            is_live: ob_config.is_live,
        },
    }))
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct CreateOnboardingConfigurationResponse {
    id: ObConfigurationId,
    publishable_key: ObConfigurationKey,
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
}

#[api_v2_operation(tags(Org))]
#[post("/config")]
/// Uses tenant public key auth to return information about the tenant
fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> actix_web::Result<Json<ApiResponseData<CreateOnboardingConfigurationResponse>>, ApiError> {
    let CreateOnboardingConfigurationRequest {
        name,
        must_collect_data_kinds,
        can_access_data_kinds,
    } = request.into_inner();

    let obc = NewObConfiguration {
        name: name.clone(),
        description: None,
        tenant_id: auth.tenant_id(),
        must_collect_data_kinds,
        can_access_data_kinds,
        settings: ObConfigurationSettings::Empty,
        is_live: auth.is_live()?,
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData {
        data: CreateOnboardingConfigurationResponse {
            id: obc.id,
            name: obc.name,
            must_collect_data_kinds: obc.must_collect_data_kinds.clone(),
            can_access_data_kinds: obc.can_access_data_kinds,
            publishable_key: obc.key,
        },
    }))
}
