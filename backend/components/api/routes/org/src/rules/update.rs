use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine::validation::validate_rules_request;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::MultiUpdateRuleRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::RuleInstanceKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Performs 1 or more edits (additions, deletions, edits) to rules for the playbooks",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::patch("/org/onboarding_configs/{obc_id}/rules")]
pub async fn multi_update_rules(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<ObConfigurationId>,
    request: Json<MultiUpdateRuleRequest>,
) -> ApiListResponse<api_wire_types::Rule> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let obc_id = path.into_inner();
    let req = request.into_inner();

    let rules = state
        .db_transaction(move |conn| {
            let update = validate_rules_request(conn, &tenant_id, is_live, req)?;

            let (obc, _) = ObConfiguration::get(conn, (&obc_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            if obc.deactivated_at.is_some() {
                return BadRequestInto("Cannot update rules for an outdated playbook version");
            }

            RuleInstance::bulk_edit(conn, &obc, &actor.into(), update)?;
            // retrieve and return full latest list of Rules for FE for convenience
            let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc.id, IncludeRules::All)?;

            // Make sure we're not removing all rules, unless this is a document-only playbook
            let is_pb_allowed_to_have_no_rules = obc.kind == ObConfigurationKind::Document;
            if rules.is_empty() && !is_pb_allowed_to_have_no_rules {
                return BadRequestInto("Proceeding would remove all rules on your playbook");
            }

            let should_pb_have_no_rules =
                obc.kind == ObConfigurationKind::Kyb && obc.verification_checks().skip_kyb();
            if should_pb_have_no_rules && rules.iter().any(|r| matches!(r.kind, RuleInstanceKind::Business)) {
                return BadRequestInto(
                    "Cannot add Business related rules to a playbook that is skipping running KYB",
                );
            }
            Ok(rules)
        })
        .await?;

    Ok(rules.into_iter().map(api_wire_types::Rule::from_db).collect())
}
