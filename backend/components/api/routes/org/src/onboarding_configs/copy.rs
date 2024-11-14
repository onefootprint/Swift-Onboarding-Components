use crate::onboarding_configs::validation::ObConfigurationArgsToValidate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
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
use api_wire_types::CreateRule;
use api_wire_types::MultiUpdateRuleRequest;
use db::models::ob_configuration::NewObConfigurationArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::VerificationChecks;
use db::models::playbook::Playbook;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set_version::RuleSetVersion;
use itertools::Itertools;
use newtypes::DbActor;
use newtypes::ObConfigurationId;
use newtypes::UnvalidatedRuleExpression;
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
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
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

    let args = copy_playbook(obc, target_actor.clone().into(), name);
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
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;
    let result = api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()));
    Ok(result)
}

fn copy_rule(r: RuleInstance) -> CreateRule {
    let RuleInstance {
        name,
        rule_expression,
        action: _,
        rule_action,
        is_shadow,

        // Don't copy these fields. Explicitly enumerate them so the compiler complains when a new
        // field is added
        id: _,
        created_at: _,
        created_seqno: _,
        _created_at: _,
        _updated_at: _,
        deactivated_at: _,
        deactivated_seqno: _,
        rule_id: _,
        ob_configuration_id: _,
        actor: _,
        kind: _,
    } = r;

    CreateRule {
        name,
        rule_action: api_wire_types::RuleActionMigration::New(rule_action),
        rule_expression: UnvalidatedRuleExpression(rule_expression.0),
        is_shadow,
    }
}

fn copy_playbook(pb: ObConfiguration, author: DbActor, name: String) -> NewObConfigurationArgs {
    let verification_checks = VerificationChecks::from_existing(&pb);
    let ObConfiguration {
        must_collect_data,
        can_access_data,
        cip_kind,
        optional_data,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        allow_us_residents,
        allow_us_territory_residents,
        kind,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect,
        business_documents_to_collect,
        required_auth_methods,
        prompt_for_passkey,
        allow_reonboard,

        // Don't copy these fields. Explicitly enumerate them so the compiler complains when a new
        // field is added
        id: _,
        key: _,
        tenant_id: _,
        _created_at: _,
        _updated_at: _,
        is_live: _,
        status: _,
        created_at: _,
        author: _,
        name: _,

        // Maybe we should copy appearance one day. But it's not really used today.
        appearance_id: _,
        verification_checks: _,
        // TODO: only thing here is enhanced_aml and skip_kyb which will be removed shortly
        ..
    } = pb;

    NewObConfigurationArgs {
        author,
        name,
        // Copied fields
        must_collect_data,
        can_access_data,
        cip_kind,
        optional_data,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        allow_us_residents,
        allow_us_territory_residents,
        kind,
        skip_confirm,
        document_types_and_countries,
        documents_to_collect: documents_to_collect.unwrap_or_default(),
        business_documents_to_collect,
        verification_checks,
        required_auth_methods,
        prompt_for_passkey,
        allow_reonboard,
    }
}
