use crate::onboarding_configs::validation::ObConfigurationArgsToValidate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine::rules::copy_rule;
use api_core::decision::rule_engine::validation::validate_rules_request;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_core::{
    self,
};
use api_errors::BadRequestInto;
use api_wire_types::CopyPlaybookRequest;
use api_wire_types::MultiUpdateRuleRequest;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set::RuleSet;
use itertools::Itertools;
use newtypes::ObConfigurationId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Copies the provided onboarding configuration into the provided tenant and provided sandbox mode."
)]
#[post("/org/onboarding_configs/{id}/copy")]
async fn post(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    request: Json<CopyPlaybookRequest>,
    source_auth: TenantSessionAuth,
    // target_auth allows the client to provide a secondary auth token to specify the destination
    // tenant to where we'll copy the playbook.
    // NOTE: x-is-live and x-allow-assumed-writes are shared between both auth extractors unfort
    target_auth: Option<TenantSessionAuth<true>>,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let (source_auth, target_actor, target_tenant) = if let Some(target_auth) = target_auth {
        // Copying into another tenant. Check read permissions at source tenant and write at destination
        let source_auth = source_auth.check_guard(TenantGuard::Read)?;
        let target_auth = target_auth.check_guard(TenantGuard::OnboardingConfiguration)?;
        let source_actor = source_auth.actor();
        let target_actor = target_auth.actor();
        if source_actor.tenant_user_id()? != target_actor.tenant_user_id()? {
            return BadRequestInto("Target tenant auth is using a different principal");
        }
        let target_tenant = target_auth.tenant().clone();
        (source_auth, target_actor, target_tenant)
    } else {
        // Copying into same tenant - make sure we have write permissions here
        let source_auth = source_auth.check_guard(TenantGuard::OnboardingConfiguration)?;
        let target_actor = source_auth.actor();
        let target_tenant = source_auth.tenant().clone();
        (source_auth, target_actor, target_tenant)
    };
    let tenant_id = source_auth.tenant().id.clone();
    let is_live = source_auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();

    let CopyPlaybookRequest {
        is_live: target_is_live,
        name,
    } = request.into_inner();

    let (obc, rules) = state
        .db_query(move |conn| {
            let (_, obc) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc.id, IncludeRules::All)?;
            Ok((obc, rules))
        })
        .await?;

    let target_tenant_id = target_tenant.id.clone();
    let tvc = TenantVendorControl::new(
        target_tenant_id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;

    let actor = target_actor.clone().into();
    let args = NewObConfigurationArgs {
        name,
        ..obc.into_copy_args(actor)
    };
    let args = ObConfigurationArgsToValidate::validate(&state, args, &target_tenant, target_is_live, &tvc)?;

    let rules = rules.into_iter().map(copy_rule).collect_vec();

    let (obc, actor, rs) = state
        .db_transaction(move |conn| {
            // Create the copied playbook
            let (playbook, obc) = Playbook::create(conn, &target_tenant_id, target_is_live, args)?;

            // And add the copied rules into the new playbook
            if !rules.is_empty() {
                let add_rules_request = MultiUpdateRuleRequest {
                    expected_rule_set_version: 0,
                    add: Some(rules),
                    edit: None,
                    delete: None,
                };
                // TODO this will error if we try to copy a rule that references a list that doesn't
                // exist in the target tenant
                let rules_update =
                    validate_rules_request(conn, &target_tenant_id, target_is_live, add_rules_request)?;
                RuleInstance::bulk_edit(conn, &playbook, &obc.id, &target_actor.into(), rules_update)?;
            }

            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSet::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;
    let result = api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()));
    Ok(result)
}
