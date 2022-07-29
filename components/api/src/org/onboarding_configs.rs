use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::IsLive;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::ob_configurations::NewObConfiguration;
use newtypes::DataKind;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKey;
use newtypes::ObConfigurationSettings;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, web, web::Json};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationResponse {
    id: ObConfigurationId,
    publishable_key: ObConfigurationKey,
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
