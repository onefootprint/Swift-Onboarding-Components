use crate::{
    ProtectedAuth,
    State,
};
use actix_web::{
    patch,
    web,
};
use api_core::decision::rule_engine;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
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
) -> JsonApiResponse<api_wire_types::Empty> {
    let ff_client = state.ff_client.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get(conn, &path.into_inner())?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, Some(ff_client))
        })
        .await?;
    Ok(api_wire_types::Empty)
}
