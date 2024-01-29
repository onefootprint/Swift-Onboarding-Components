use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::NewUserSessionArgs;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionPurpose;
use api_core::config::LinkKind;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::errors::ApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_wire_types::CreateTokenResponse;
use api_wire_types::TriggerRequest;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::NewWorkflowRequestArgs;
use db::models::workflow_request::WorkflowRequest;
use newtypes::DbActor;
use newtypes::TriggerKind;
use newtypes::VaultKind;
use newtypes::WorkflowTriggeredInfo;
use paperclip::actix::{api_v2_operation, post, web};

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
    let trigger_kind = (&trigger).into();
    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &sv.id)?;
            validate(trigger_kind, &sv)?;

            if vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
            }

            let (_, obc) = Workflow::latest(conn, &sv.id, false)?.ok_or(UserError::NoCompleteOnboardings)?;

            let config = trigger.into();
            let wfr_args = NewWorkflowRequestArgs {
                scoped_vault_id: sv.id.clone(),
                ob_configuration_id: obc.id.clone(),
                created_by: actor.clone(),
                config,
                note,
            };
            let wfr = WorkflowRequest::create(conn, wfr_args)?;
            let context = NewUserSessionContext {
                su_id: Some(sv.id.clone()),
                obc_id: Some(obc.id.clone()),
                wfr_id: Some(wfr.id.clone()),
                is_from_api: true,
                ..Default::default()
            };
            // No scopes or auth factors - require the user to re-auth when using this token
            let duration = Duration::days(3);
            let args = NewUserSessionArgs {
                user_vault_id: sv.vault_id.clone(),
                purpose: Some(UserSessionPurpose::ApiInherit),
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

fn validate(trigger_info: TriggerKind, scoped_vault: &ScopedVault) -> ApiResult<()> {
    match trigger_info {
        TriggerKind::RedoKyc => Ok(()),
        TriggerKind::IdDocument | TriggerKind::ProofOfSsn | TriggerKind::ProofOfAddress => {
            // if docs only or we have a decision
            // TODO: theoretically we should be checking risk signals here too or that there's an FP decision, but maybe not
            if scoped_vault.status.map(|d| d.has_decision()).unwrap_or(false) {
                Ok(())
            } else {
                Err(UserError::NoCompleteOnboardings.into())
            }
        }
    }
}
