use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiError,
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::errors::ApiResult;
use db::models::{ob_configuration::ObConfiguration, rule_set_version::RuleSetVersion};
use newtypes::{ApiKeyStatus, ObConfigurationId};
use paperclip::actix::{api_v2_operation, patch, web, web::Json, Apiv2Schema};

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
    tags(Playbooks, Organization, Private)
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
    let (obc, actor, rs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let obc = ObConfiguration::update(conn, &id, &tenant_id, is_live, name, status)?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone())),
    )))
}
