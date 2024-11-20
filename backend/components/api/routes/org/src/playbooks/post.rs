use crate::onboarding_configs::validation::prepare_onboarding_configuration_request;
use crate::onboarding_configs::validation::ObConfigurationArgsToValidate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine;
use api_core::decision::rule_engine::rules::copy_rule;
use api_core::decision::rule_engine::validation::validate_rules_request;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::CreateOnboardingConfigurationRequest;
use api_wire_types::MultiUpdateRuleRequest;
use api_wire_types::RestoreOnboardingConfigurationRequest;
use db::models::audit_event::AuditEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set::RuleSet;
use itertools::Itertools;
use macros::route_alias;
use newtypes::AuditEventDetail;
use newtypes::PlaybookId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;


// TODO: migrate clients to /org/playbooks
#[route_alias(post(
    "/org/onboarding_configs",
    tags(Playbooks, Organization, Private),
    description = "Creates a new playbook."
))]
#[api_v2_operation(
    description = "Creates a new playbook.",
    tags(Playbooks, Organization, Private)
)]
#[post("/org/playbooks")]
pub async fn post_create_playbook(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateOnboardingConfigurationRequest>,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let is_live = auth.is_live()?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let actor = auth.actor().into();

    let obc_request = request.into_inner();
    let obc_args =
        prepare_onboarding_configuration_request(&state, obc_request, tenant, is_live, actor).await?;

    let principal_actor = auth.actor();
    let (obc, actor, rs) = state
        .db_transaction(move |conn| {
            let (playbook, obc) = Playbook::create(conn, &tenant_id, is_live, obc_args)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &playbook, &obc.id)?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;
            let detail = AuditEventDetail::CreatePlaybook {
                ob_configuration_id: obc.id.clone(),
                is_live,
            };
            AuditEvent::create_with_insight(conn, &tenant_id, principal_actor, insight.clone(), detail)?;
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

#[api_v2_operation(
    description = "Creates a new version (onboarding configuration) for the given playbook that is a copy ",
    tags(Playbooks, Organization, Private)
)]
#[post("/org/playbooks/{playbook_id}/restore")]
pub async fn post_restore(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    playbook_id: web::Path<PlaybookId>,
    request: Json<RestoreOnboardingConfigurationRequest>,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let playbook_id = playbook_id.into_inner();
    let RestoreOnboardingConfigurationRequest {
        expected_latest_obc_id,
        restore_obc_id,
    } = request.into_inner();

    let (latest_obc, restore_obc, restore_rules) = state
        .db_query({
            let tenant_id = tenant_id.clone();
            let playbook_id = playbook_id.clone();
            move |conn| {
                let (_, latest_obc, _) =
                    Playbook::get_latest_version(conn, (&playbook_id, &tenant_id, is_live))?;
                let (obc, _) = ObConfiguration::get(conn, &restore_obc_id)?;

                let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc.id, IncludeRules::All)?;

                Ok((latest_obc, obc, rules))
            }
        })
        .await?;

    if latest_obc.id != expected_latest_obc_id {
        return BadRequestInto!("Can not update playbook since the changes would overwrite a newer version",);
    }

    if restore_obc.playbook_id != playbook_id {
        return BadRequestInto!("ObConfiguration does not belong to this playbook");
    }

    let tvc = TenantVendorControl::new(
        tenant.id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;
    let obc_args = restore_obc.into_copy_args(actor.clone().into());
    let obc_args = ObConfigurationArgsToValidate::validate(&state, obc_args, tenant, is_live, &tvc)?;

    let restore_rules = restore_rules.into_iter().map(copy_rule).collect_vec();

    let (obc, actor, rs) = state
        .db_transaction(move |conn| {
            let playbook = Playbook::lock(conn, (&playbook_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::create(conn, &playbook, obc_args)?;

            if !restore_rules.is_empty() {
                let add_rules_request = MultiUpdateRuleRequest {
                    expected_rule_set_version: 0,
                    add: Some(restore_rules),
                    edit: None,
                    delete: None,
                };
                let rules_update = validate_rules_request(conn, &tenant_id, is_live, add_rules_request)?;
                RuleInstance::bulk_edit(conn, &playbook, &obc.id, &actor.into(), rules_update)?;
            }

            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    let result = api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()));
    Ok(result)
}
