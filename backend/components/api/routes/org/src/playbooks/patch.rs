use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::UpdatePlaybookRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationUpdate;
use db::models::playbook::Playbook;
use db::models::rule_set::RuleSet;
use newtypes::PlaybookId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Updates an existing playbook.",
    tags(Playbooks, Organization, Private)
)]
#[patch("/org/playbooks/{id}")]
async fn patch(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<PlaybookId>,
    request: web::Json<UpdatePlaybookRequest>,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;

    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let playbook_id = path.into_inner();
    let UpdatePlaybookRequest { status } = request.into_inner();

    let (obc, actor, rs) = state
        .db_transaction(move |conn| {
            let playbook = Playbook::lock(conn, (&playbook_id, &tenant_id, is_live))?;

            // TODO: migrate to Playbook::update
            let update = ObConfigurationUpdate {
                status,
                ..Default::default()
            };
            let (_, obc, _) = Playbook::get_latest_version(conn, &playbook_id)?;
            let obc = ObConfiguration::update(conn, playbook, &obc.id, update)?;

            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;
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
