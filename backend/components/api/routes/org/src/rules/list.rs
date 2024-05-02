use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use db::{
    models::rule_instance::{IncludeRules, RuleInstance},
    DbError,
};
use itertools::Itertools;
use newtypes::ObConfigurationId;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "List all Rules for the playbook",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::get("/org/onboarding_configs/{obc_id}/rules")]
pub async fn list_rules_for_playbook(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ob_config_id: web::Path<ObConfigurationId>,
) -> ApiResult<Json<ResponseData<Vec<api_wire_types::Rule>>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let rules = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            RuleInstance::list(conn, &tenant_id, is_live, &ob_config_id, IncludeRules::All)
        })
        .await?;

    ResponseData::ok(rules.into_iter().map(api_wire_types::Rule::from_db).collect_vec()).json()
}
