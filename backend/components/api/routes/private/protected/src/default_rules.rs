use crate::ProtectedAuth;
use crate::State;
use actix_web::patch;
use actix_web::web;
use api_core::decision::rule_engine;
use api_core::types::ApiResponse;
use db::models::ob_configuration::ObConfiguration;
use newtypes::ObConfigurationId;

/// Writes default rules for the given playbook. If the playbook already has rules, then nothing
/// happens.
// TODO: can remove this now
#[patch("/private/protected/onboarding_configs/{ob_config_id}/add_default_rules")]
pub async fn add_default_rules(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<ObConfigurationId>,
) -> ApiResponse<api_wire_types::Empty> {
    state
        .db_transaction(move |conn| {
            let (obc, _) = ObConfiguration::get(conn, &path.into_inner())?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc)
        })
        .await?;
    Ok(api_wire_types::Empty)
}
