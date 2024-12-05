use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationUpdate;
use db::models::playbook::Playbook;
use db::models::rule_set::RuleSet;
use newtypes::ApiKeyStatus;
use newtypes::ObConfigurationId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigPath {
    id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct UpdateObConfigRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
    prompt_for_passkey: Option<bool>,
    skip_confirm: Option<bool>,
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
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;

    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;


    let UpdateObConfigPath { id: obc_id } = path.into_inner();
    let UpdateObConfigRequest {
        name,
        status,
        prompt_for_passkey,
        skip_confirm,
    } = request.into_inner();
    let (playbook, obc, actor, rs) = state
        .db_transaction(move |conn| {
            let update = ObConfigurationUpdate {
                name,
                status,
                prompt_for_passkey,
                skip_confirm,
                ..Default::default()
            };
            let playbook = Playbook::lock(conn, (&obc_id, &tenant_id, is_live))?;
            let playbook_id = playbook.id.clone();
            let obc = ObConfiguration::update(conn, playbook, &obc_id, update)?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;

            // Temp workaround during the status refactor:
            let playbook = Playbook::get(conn, &playbook_id)?;

            Ok((playbook, obc, actor, rs))
        })
        .await?;

    Ok(api_wire_types::OnboardingConfiguration::from_db((
        playbook,
        obc,
        actor,
        rs,
        state.ff_client.clone(),
    )))
}
