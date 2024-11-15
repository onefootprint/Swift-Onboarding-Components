use crate::onboarding_configs::validation::prepare_onboarding_configuration_request;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine::rules::copy_rule;
use api_core::decision::rule_engine::validation::validate_rules_request;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::DryRun;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::CreatePlaybookVersionRequest;
use api_wire_types::MultiUpdateRuleRequest;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set::RuleSet;
use itertools::Itertools;
use newtypes::PlaybookId;
use newtypes::RuleSetId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::put;
use paperclip::actix::web;
use paperclip::actix::web::Json;


#[api_v2_operation(
    description = "Creates a new version (onboarding configuration) for the given playbook.",
    tags(Playbooks, Organization, Private)
)]
#[put("/org/playbooks/{playbook_id}")]
pub async fn put_create_version(
    state: web::Data<State>,
    playbook_id: web::Path<PlaybookId>,
    request: Json<CreatePlaybookVersionRequest>,
    dry_run: DryRun,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor().clone();

    let playbook_id = playbook_id.into_inner();
    let CreatePlaybookVersionRequest {
        expected_latest_obc_id,
        new_onboarding_config: obc_request,
    } = request.into_inner();

    let dry_run = dry_run.into_inner();

    let obc_args =
        prepare_onboarding_configuration_request(&state, obc_request, &tenant, is_live, actor.clone().into())
            .await?;

    let (obc, actor, rs) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let playbook = Playbook::lock(conn, (&playbook_id, &tenant.id, is_live))?;

            let (_, latest_obc, tenant) =
                Playbook::get_latest_version(conn, (&playbook.id, &tenant.id, is_live))?;

            if latest_obc.id != expected_latest_obc_id {
                return BadRequestInto!(
                    "Can not update playbook since the changes would overwrite a newer version",
                );
            }

            if dry_run {
                let new_obc = ObConfiguration::new_dry_run(&playbook, obc_args);
                let auth_actor = actor;
                let (new_obc, actor) = db::actor::saturate_actor_nullable(conn, new_obc)?;

                let rs = RuleSet {
                    id: RuleSetId::default(),
                    created_at: Utc::now(),
                    created_seqno: DataLifetime::get_current_seqno(conn.conn())?,
                    _created_at: Utc::now(),
                    _updated_at: Utc::now(),
                    deactivated_at: None,
                    deactivated_seqno: None,
                    version: 1,
                    ob_configuration_id: new_obc.id.clone(),
                    actor: auth_actor.into(),
                };
                return Ok((new_obc, actor, Some(rs)));
            }

            let new_obc = ObConfiguration::create(conn, &playbook, obc_args)?;

            let rules = RuleInstance::list(conn, &tenant.id, is_live, &latest_obc.id, IncludeRules::All)?;
            if !rules.is_empty() {
                let add_rules = rules.into_iter().map(copy_rule).collect_vec();
                let add_rules_request = MultiUpdateRuleRequest {
                    expected_rule_set_version: 0,
                    add: Some(add_rules),
                    edit: None,
                    delete: None,
                };
                let rules_update = validate_rules_request(conn, &tenant.id, is_live, add_rules_request)?;
                RuleInstance::bulk_edit(conn, &playbook, &new_obc.id, &actor.clone().into(), rules_update)?;
            }

            let (new_obc, actor) = db::actor::saturate_actor_nullable(conn, new_obc)?;
            let new_rs = RuleSet::get_active(conn, &new_obc.id)?;
            Ok((new_obc, actor, new_rs))
        })
        .await?;

    Ok(api_wire_types::OnboardingConfiguration::from_db((
        obc,
        actor,
        rs,
        state.ff_client.clone(),
    )))
}
