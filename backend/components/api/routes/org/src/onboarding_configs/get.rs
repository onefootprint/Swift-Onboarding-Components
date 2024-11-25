use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_set::RuleSet;
use newtypes::ObConfigurationId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns an onboarding configuration."
)]
#[get("/org/onboarding_configs/{id}")]
async fn get_detail(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();

    let (obc, actor, rs) = state
        .db_query(move |conn| {
            let (_, obc) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    let result = api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()));
    Ok(result)
}
