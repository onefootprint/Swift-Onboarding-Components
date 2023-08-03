use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, TenantSessionAuth};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use newtypes::ApiKeyStatus;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, patch, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigPath {
    id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[api_v2_operation(
    description = "Updates an existing onboarding configuration.",
    tags(Organization, Private)
)]
#[patch("/org/onboarding_configs/{id}")]
async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<UpdateObConfigPath>,
    request: web::Json<UpdateObConfigRequest>,
) -> actix_web::Result<Json<ResponseData<api_wire_types::OnboardingConfiguration>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let UpdateObConfigPath { id } = path.into_inner();
    let UpdateObConfigRequest { name, status } = request.into_inner();
    let tenant_id = tenant.id.clone();
    let result = state
        .db_pool
        .db_transaction(move |conn| ObConfiguration::update(conn, &id, &tenant_id, is_live, name, status))
        .await?;

    let ff_client = state.feature_flag_client.clone();
    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((result, tenant, None, ff_client)),
    )))
}
