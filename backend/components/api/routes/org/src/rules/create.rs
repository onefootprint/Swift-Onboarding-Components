use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{decision::rule_engine::validation::validate_rule_expression, ApiError};
use api_wire_types::CreateRuleRequest;
use db::models::{list::List, ob_configuration::ObConfiguration, rule_instance::RuleInstance};
use newtypes::{ObConfigurationId, RuleInstanceKind};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

/// Note: Being deprecated in favor of bulk edit API
#[api_v2_operation(
    description = "Creates a new Rule for the playbook",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::post("/org/onboarding_configs/{id}/rules")]
pub async fn create_rule(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ob_config_id: web::Path<ObConfigurationId>,
    request: Json<CreateRuleRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::Rule>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let CreateRuleRequest {
        name,
        rule_expression,
        action,
    } = request.into_inner();

    let rule = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let list_ids = rule_expression.list_ids();
            let lists = List::bulk_get(conn, &tenant_id, is_live, &list_ids)?;
            // TODO: validate kind
            let rule_expression = validate_rule_expression(rule_expression, &lists, is_live)?;

            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id.into_inner(), &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?; //TODO: maybe just change lock to take in (obc, tenant_id, is_live)?
            Ok(RuleInstance::create(
                conn,
                &obc,
                &actor.into(),
                name,
                rule_expression,
                action,
                RuleInstanceKind::Person,
            )?)
        })
        .await?;

    ResponseData::ok(api_wire_types::Rule::from_db(rule)).json()
}
