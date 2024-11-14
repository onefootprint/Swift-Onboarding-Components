use crate::ProtectedAuth;
use crate::State;
use actix_web::patch;
use actix_web::web;
use api_core::decision::rule_engine;
use api_core::types::ApiResponse;
use db::models::ob_configuration::IsLive;
use db::models::playbook::Playbook;
use newtypes::ObConfigurationId;
use newtypes::TenantId;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct AddDefaultRulesRequest {
    tenant_id: TenantId,
    is_live: IsLive,
}

/// Writes default rules for the given playbook. If the playbook already has rules, then nothing
/// happens.
// TODO: can remove this now
#[patch("/private/protected/onboarding_configs/{playbook_id}/add_default_rules")]
pub async fn add_default_rules(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<ObConfigurationId>,
    request: web::Json<AddDefaultRulesRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let playbook_id = path.into_inner();

    let AddDefaultRulesRequest { tenant_id, is_live } = request.into_inner();


    state
        .db_transaction(move |conn| {
            let playbook = Playbook::lock(conn, (&playbook_id, &tenant_id, is_live))?;
            let (_, obc, _) = Playbook::get_latest_version(conn, (&playbook.id, &tenant_id, is_live))?;

            rule_engine::default_rules::save_default_rules_for_obc(conn, &playbook, &obc.id)
        })
        .await?;
    Ok(api_wire_types::Empty)
}
