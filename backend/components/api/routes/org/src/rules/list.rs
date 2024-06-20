use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::DbError;
use newtypes::ObConfigurationId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "List all Rules for the playbook",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::get("/org/onboarding_configs/{obc_id}/rules")]
pub async fn list_rules_for_playbook(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ob_config_id: web::Path<ObConfigurationId>,
) -> JsonApiListResponse<api_wire_types::Rule> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let rules = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            RuleInstance::list(conn, &tenant_id, is_live, &ob_config_id, IncludeRules::All)
        })
        .await?;

    Ok(rules.into_iter().map(api_wire_types::Rule::from_db).collect())
}
