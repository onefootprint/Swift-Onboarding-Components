use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_wire_types::CreateRuleRequest;
use db::{
    models::{ob_configuration::ObConfiguration, rule_instance::RuleInstance},
    DbError,
};
use newtypes::ObConfigurationId;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

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
        .db_query(move |conn| -> Result<_, DbError> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id.into_inner(), &tenant_id, is_live))?;
            RuleInstance::create(conn, obc.id, actor.into(), name, rule_expression, action.into())
        })
        .await?;

    ResponseData::ok(api_wire_types::Rule::from_db(rule)).json()
}
