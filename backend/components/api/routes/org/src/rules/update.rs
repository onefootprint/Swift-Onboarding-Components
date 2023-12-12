use crate::auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth};
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::errors::ValidationError;
use api_wire_types::UpdateRuleRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::{RuleInstance, RuleInstanceUpdate};
use db::DbResult;
use newtypes::{ObConfigurationId, RuleId};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Updates a Rule", tags(Playbooks, Organization, Private, Rules))]
#[actix::patch("/org/onboarding_configs/{obc_id}/rules/{rule_id}")]
pub async fn update_rule(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<(ObConfigurationId, RuleId)>,
    request: Json<UpdateRuleRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::Rule>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let (ob_config_id, rule_id) = path.into_inner();
    let UpdateRuleRequest {
        name,
        rule_expression,
        is_shadow,
    } = request.into_inner();

    if name.is_none() && rule_expression.is_none() && is_shadow.is_none() {
        return Err(ValidationError("No field given to update").into());
    }

    let rule = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;

            RuleInstance::update(
                conn,
                &obc.id,
                actor.into(),
                &rule_id,
                RuleInstanceUpdate::update(name, rule_expression, is_shadow),
            )
        })
        .await?;

    ResponseData::ok(api_wire_types::Rule::from_db(rule)).json()
}
