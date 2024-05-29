use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::{
    NewUserSessionArgs,
    NewUserSessionContext,
    TokenCreationPurpose,
    UserSession,
};
use api_core::config::LinkKind;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::errors::{
    ApiResult,
    ValidationError,
};
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_wire_types::{
    CreateTokenResponse,
    TriggerRequest,
};
use chrono::Duration;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::{
    NewWorkflowRequestArgs,
    WorkflowRequest,
};
use newtypes::{
    DbActor,
    DocumentRequestConfig,
    ObConfigurationKind,
    VaultKind,
    WorkflowRequestConfig,
    WorkflowTriggeredInfo,
};
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    description = "Trigger a workflow for the provided user.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/triggers")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<TriggerRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<CreateTokenResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let TriggerRequest { trigger, note } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();
    let actor = DbActor::from(auth.actor());

    // Generate an auth token for the user and send to their phone number on file
    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &sv.id)?;
            validate(&trigger, &sv)?;

            if vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
            }

            let obc = if let WorkflowRequestConfig::Onboard { playbook_id } = &trigger {
                // Trigger specifically requested the playbook onto which the user should onboard
                let (obc, _) = ObConfiguration::get(conn, (playbook_id, &tenant_id, is_live))?;
                obc
            } else {
                // For all other trigger kinds, just associate the last playbook with the WFR.
                // This applies the same rules to from the last playbook to the WF that this creates.
                let (_, obc) = Workflow::latest_reonboardable(conn, &sv.id, false)?
                    .ok_or(UserError::NoCompleteOnboardings)?;
                obc
            };
            if obc.kind == ObConfigurationKind::Auth {
                return ValidationError("Cannot triggering onboarding onto an auth playbook").into();
            }

            let wfr_args = NewWorkflowRequestArgs {
                scoped_vault_id: sv.id.clone(),
                ob_configuration_id: obc.id.clone(),
                created_by: actor.clone(),
                config: trigger,
                note,
            };
            let wfr = WorkflowRequest::create(conn, wfr_args)?;
            let context = NewUserSessionContext {
                su_id: Some(sv.id.clone()),
                obc_id: Some(obc.id.clone()),
                wfr_id: Some(wfr.id.clone()),
                ..Default::default()
            };
            // No scopes or auth factors - require the user to re-auth when using this token
            let duration = Duration::days(3);
            let args = NewUserSessionArgs {
                user_vault_id: sv.vault_id.clone(),
                purposes: vec![TokenCreationPurpose::ApiInherit],
                context,
                scopes: vec![],
                auth_events: vec![],
            };
            let data = UserSession::make(args)?;
            let (token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            // Create a timeline event logging that the workflow was triggered
            let event = WorkflowTriggeredInfo {
                workflow_id: None,
                ob_config_id: Some(obc.id),
                workflow_request_id: Some(wfr.id.clone()),
                actor,
            };
            UserTimeline::create(conn, event, sv.vault_id.clone(), sv.id.clone())?;
            // Create an auth token for this workflow that we will send to the user
            Ok((token, session))
        })
        .await?;

    let link = state
        .config
        .service_config
        .generate_link(LinkKind::VerifyUser, &token);

    let expires_at = session.expires_at;
    let response = CreateTokenResponse {
        token,
        link,
        expires_at,
    };
    ResponseData::ok(response).json()
}

fn validate(trigger: &WorkflowRequestConfig, scoped_vault: &ScopedVault) -> ApiResult<()> {
    match trigger {
        WorkflowRequestConfig::RedoKyc { .. } | WorkflowRequestConfig::Onboard { .. } => Ok(()),
        WorkflowRequestConfig::Document { configs } => {
            // Since the proceeding workflow would overwrite the scoped vault's status, we don't
            // to allow running a document workflow unless the user has already onboarded onto
            // another playbook and hopefully has a KYC status/risk signals.
            // Otherwise, the a document workflow could change a user's status to pass before any
            // KYC is run.
            // The frontend also disables these options.
            // TODO: theoretically we should be checking risk signals here too or that there's an FP decision,
            // but maybe not
            if !scoped_vault.status.map(|d| d.has_decision()).unwrap_or(false) {
                return Err(UserError::NoCompleteOnboardings.into());
            }
            DocumentRequestConfig::validate(configs)?;
            Ok(())
        }
    }
}
