use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    State,
};
use api_core::types::{EmptyResponse, JsonApiResponse};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        rule_instance::{RuleInstance, RuleInstanceUpdate},
    },
    DbResult,
};
use newtypes::{ObConfigurationId, RuleId};
use paperclip::actix::{self, api_v2_operation, web};

/// Note: Being deprecated in favor of bulk edit API
#[api_v2_operation(description = "Deletes a Rule", tags(Playbooks, Organization, Private, Rules))]
#[actix::delete("/org/onboarding_configs/{obc_id}/rules/{rule_id}")]
pub async fn delete(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<(ObConfigurationId, RuleId)>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let (ob_config_id, rule_id) = path.into_inner();
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            RuleInstance::update(conn, &obc, &actor.into(), RuleInstanceUpdate::delete(rule_id))
        })
        .await?;

    EmptyResponse::ok().json()
}
