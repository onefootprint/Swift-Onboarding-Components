use crate::onboarding_configs::validation::prepare_onboarding_configuration_request;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::CreateOnboardingConfigurationRequest;
use db::models::playbook::Playbook;
use db::models::rule_set_version::RuleSetVersion;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    description = "Creates a new onboarding configuration.",
    tags(Playbooks, Organization, Private)
)]
#[post("/org/onboarding_configs")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateOnboardingConfigurationRequest>,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let is_live = auth.is_live()?;
    let tenant = auth.tenant().clone();
    let tenant_id = tenant.id.clone();
    let actor = auth.actor().into();

    let obc_request = request.into_inner();
    let obc_args =
        prepare_onboarding_configuration_request(&state, obc_request, &tenant, is_live, actor).await?;

    let (obc, actor, rs) = state
        .db_transaction(move |conn| {
            let (playbook, obc) = Playbook::create(conn, &tenant_id, is_live, obc_args)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &playbook, &obc.id)?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    Ok(api_wire_types::OnboardingConfiguration::from_db((
        obc,
        actor,
        rs,
        state.ff_client.clone(),
    )))
}
