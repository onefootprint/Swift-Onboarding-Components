use crate::auth::ob_config::ObConfigAuth;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::ob_config::PublicOnboardingContext;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserSessionContext;
use api_core::auth::Any;
use api_core::auth::AuthError;
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
    ob_pk_auth: Option<ObConfigAuth>,
    user_auth: Option<UserAuthContext>,
) -> ApiResponse<api_wire_types::PublicOnboardingConfiguration> {
    let user_auth = user_auth.map(|ua| ua.check_guard(Any)).transpose()?;
    let (tenant, playbook, ob_config, user_auth) = match (user_auth, ob_pk_auth) {
        (Some(user_auth), Some(ob_pk_auth))
            if (user_auth.obc.as_ref()).is_some_and(|obc| obc.id != ob_pk_auth.ob_config().id) =>
        {
            return Err(OnboardingError::ConflictingPlaybookKey.into());
        }
        (Some(user_auth), _) => {
            let playbook = user_auth.playbook.clone().ok_or(OnboardingError::NoPlaybook)?;
            let ob_config = user_auth.obc.clone().ok_or(OnboardingError::NoPlaybook)?;
            let tenant = user_auth.tenant.clone().ok_or(OnboardingError::NoPlaybook)?;
            (tenant, playbook, ob_config, Some(user_auth))
        }
        (None, Some(ob_pk_auth)) => {
            let tenant = ob_pk_auth.tenant().clone();
            let playbook = ob_pk_auth.playbook().clone();
            let ob_config = ob_pk_auth.ob_config().clone();
            (tenant, playbook, ob_config, None)
        }
        (None, None) => {
            let missing_headers = vec![
                PublicOnboardingContext::HEADER_NAME.to_owned(),
                UserSessionContext::HEADER_NAME.to_owned(),
            ];
            return Err(AuthError::MissingHeader(missing_headers).into());
        }
    };

    let tenant_id = tenant.id.clone();
    let appearance_id = ob_config.appearance_id.clone();
    let is_live = playbook.is_live;
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
        playbook,
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
