use crate::auth::ob_config::ObConfigAuth;
use crate::auth::Either;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::onboarding::OnboardingError;
use api_core::types::ApiResponse;
use db::models::appearance::Appearance;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::tenant_client_config::TenantClientConfig;
use db::DbResult;
use db::PgConn;
use macros::route_alias;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::RuleAction;
use newtypes::TenantId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[route_alias(get(
    "/org/onboarding_config",
    tags(Onboarding, Deprecated),
    description = "Fetch an onboarding configuration",
))] // TODO: remove alias once we migrate the endpoints
#[api_v2_operation(
    tags(Onboarding, Organization, Hosted),
    description = "Get the details of an onboarding configuration."
)]
#[get("/hosted/onboarding/config")]
pub fn get(
    state: web::Data<State>,
    auth: Either<ObConfigAuth, UserAuthContext>,
) -> ApiResponse<api_wire_types::PublicOnboardingConfiguration> {
    let (tenant, ob_config) = match auth {
        Either::Left(ob_pk_auth) => {
            // Support auth that identifies an ob config
            let tenant = ob_pk_auth.tenant().clone();
            let ob_config = ob_pk_auth.ob_config().clone();
            (tenant, ob_config)
        }
        Either::Right(user_auth) => {
            // Also take in a user auth token that has the onboarding scope that identifies an ob
            // config
            let user_auth = user_auth.check_guard(Any)?;
            let ob_config = user_auth.ob_config().ok_or(OnboardingError::NoObConfig)?.clone();
            let tenant = user_auth.tenant().ok_or(OnboardingError::NoObConfig)?.clone();
            (tenant, ob_config)
        }
    };

    let tenant_id = tenant.id.clone();
    let appearance_id = ob_config.appearance_id.clone();
    let is_live = ob_config.is_live;
    let obc_id = ob_config.id.clone();
    let obc_kind = ob_config.kind;

    // get other properties of our configuration relevant to rendering it
    let (appearance, client_config, sandbox_stepup_outcome_enabled) = state
        .db_query(move |conn| -> DbResult<_> {
            let appearance = if let Some(appearance_id) = appearance_id {
                Some(Appearance::get(conn, &appearance_id, &tenant_id)?)
            } else {
                None
            };
            let client_config = TenantClientConfig::get(conn, &tenant_id, is_live)?;

            // Allow users to choose `Stepup` as a sandbox outcome
            let sandbox_stepup_outcome_enabled = if !is_live && matches!(obc_kind, ObConfigurationKind::Kyc) {
                is_sandbox_stepup_outcome_enabled(conn, &tenant_id, &obc_id)?
            } else {
                false
            };


            Ok((appearance, client_config, sandbox_stepup_outcome_enabled))
        })
        .await?;

    let ff_client = state.ff_client.clone();


    Ok(api_wire_types::PublicOnboardingConfiguration::from_db((
        ob_config,
        tenant,
        client_config,
        appearance,
        ff_client,
        Some(sandbox_stepup_outcome_enabled),
    )))
}


fn is_sandbox_stepup_outcome_enabled(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    obc_id: &ObConfigurationId,
) -> DbResult<bool> {
    let res = RuleInstance::list(conn, tenant_id, false, obc_id, IncludeRules::All)?
        .iter()
        .any(|ri| matches!(ri.action, RuleAction::StepUp(_)));

    Ok(res)
}
