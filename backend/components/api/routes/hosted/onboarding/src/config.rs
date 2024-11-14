use crate::auth::ob_config::ObConfigAuth;
use crate::auth::Either;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::onboarding::OnboardingError;
use api_core::types::ApiResponse;
use api_errors::BadRequestWithCode;
use api_errors::FpErrorCode;
use api_errors::FpResult;
use db::models::appearance::Appearance;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::tenant_client_config::TenantClientConfig;
use db::models::workflow_request::WorkflowRequest;
use db::models::workflow_request_junction::WorkflowRequestJunction;
use db::PgConn;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::RuleAction;
use newtypes::TenantId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Onboarding, Organization, Hosted),
    description = "Get the details of an onboarding configuration."
)]
#[get("/hosted/onboarding/config")]
pub fn get(
    state: web::Data<State>,
    auth: Either<ObConfigAuth, UserAuthContext>,
) -> ApiResponse<api_wire_types::PublicOnboardingConfiguration> {
    let (tenant, ob_config, user_auth) = match auth {
        Either::Left(ob_pk_auth) => {
            // Support auth that identifies an ob config
            let tenant = ob_pk_auth.tenant().clone();
            let ob_config = ob_pk_auth.ob_config().clone();
            (tenant, ob_config, None)
        }
        Either::Right(user_auth) => {
            // Also take in a user auth token that has the onboarding scope that identifies an ob
            // config
            let user_auth = user_auth.check_guard(Any)?;
            let ob_config = user_auth.obc.clone().ok_or(OnboardingError::NoObConfig)?;
            let tenant = user_auth.tenant.clone().ok_or(OnboardingError::NoObConfig)?;
            (tenant, ob_config, Some(user_auth))
        }
    };

    let tenant_id = tenant.id.clone();
    let appearance_id = ob_config.appearance_id.clone();
    let is_live = ob_config.is_live;
    let obc_id = ob_config.id.clone();
    let obc_kind = ob_config.kind;

    // get other properties of our configuration relevant to rendering it
    let (appearance, client_config, wfr, sandbox_stepup_outcome_enabled) = state
        .db_query(move |conn| {
            let appearance = appearance_id
                .map(|id| Appearance::get(conn, &id, &tenant_id))
                .transpose()?;
            let client_config = TenantClientConfig::get(conn, &tenant_id, is_live)?;

            // Allow users to choose `Stepup` as a sandbox outcome
            let sandbox_stepup_outcome_enabled = if !is_live && matches!(obc_kind, ObConfigurationKind::Kyc) {
                is_sandbox_stepup_outcome_enabled(conn, &tenant_id, &obc_id)?
            } else {
                false
            };

            let wfr_id = user_auth.and_then(|ua| ua.data.session.wfr_id.zip(ua.data.session.su_id));
            let wfr = if let Some((wfr_id, su_id)) = wfr_id {
                let wfr = WorkflowRequest::get(conn, &wfr_id, &su_id)?;
                let (_, wf) = WorkflowRequestJunction::get(conn, &wfr_id, &su_id)?;
                if wf.is_some_and(|wf| wf.completed_at.is_some()) {
                    return BadRequestWithCode(
                        "This link has already been used.",
                        FpErrorCode::LinkAlreadyUsed,
                    )
                    .into();
                }
                Some(wfr)
            } else {
                None
            };

            Ok((appearance, client_config, wfr, sandbox_stepup_outcome_enabled))
        })
        .await?;

    let ff_client = state.ff_client.clone();

    // TODO: serialize some wfr context
    Ok(api_wire_types::PublicOnboardingConfiguration::from_db((
        ob_config,
        tenant,
        wfr,
        client_config,
        appearance,
        ff_client,
        sandbox_stepup_outcome_enabled,
    )))
}


fn is_sandbox_stepup_outcome_enabled(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    obc_id: &ObConfigurationId,
) -> FpResult<bool> {
    let res = RuleInstance::list(conn, tenant_id, false, obc_id, IncludeRules::All)?
        .iter()
        .any(|ri| matches!(ri.action, RuleAction::StepUp(_)));

    Ok(res)
}
