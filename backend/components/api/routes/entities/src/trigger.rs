use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionArgs;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::errors::ApiResult;
use api_core::types::EmptyResponse;
use api_core::utils::email::SendgridClient;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::TriggerRequest;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use newtypes::ContactInfoKind;
use newtypes::DbActor;
use newtypes::OnboardingStatus;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::TriggerKind;
use newtypes::VaultKind;
use newtypes::WorkflowTriggeredInfo;
use paperclip::actix::{api_v2_operation, post, web};
use std::collections::HashMap;

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
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let TriggerRequest { trigger, note } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();
    let actor = DbActor::from(auth.actor());

    // Generate an auth token for the user and send to their phone number on file
    let trigger_kind = (&trigger).into();
    let (vw, auth_token) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            validate(trigger_kind, &sv)?;

            if vw.vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
            }

            let (_, obc) = Workflow::latest(conn, &sv.id, false)?.ok_or(UserError::NoCompleteOnboardings)?;

            let config = trigger.into();
            let wr = WorkflowRequest::create(conn, sv.id.clone(), obc.id.clone(), actor.clone(), config)?;
            let auth_args = UserSessionArgs {
                su_id: Some(sv.id.clone()),
                obc_id: Some(obc.id.clone()),
                wfr_id: Some(wr.id.clone()),
                is_from_api: true,
                ..Default::default()
            };
            let event = WorkflowTriggeredInfo {
                workflow_id: None,
                ob_config_id: Some(obc.id),
                workflow_request_id: Some(wr.id),
                actor,
            };

            // No scopes or auth factors - require the user to re-auth when using this token
            let duration = Duration::days(1);
            let data = UserSession::make(sv.vault_id.clone(), auth_args, vec![], vec![])?;
            let (auth_token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            // Create a timeline event logging that the workflow was triggered
            UserTimeline::create(conn, event, sv.vault_id.clone(), sv.id.clone())?;
            // Create an auth token for this workflow that we will send to the user
            Ok((vw, auth_token))
        })
        .await?;

    let link = state
        .config
        .service_config
        .generate_verify_link(auth_token, "user");
    let org_name = auth.tenant().name.clone();

    let msg = TriggerMessage {
        note,
        org_name,
        trigger_kind,
        link,
    };

    if let Some(phone) = vw.decrypt_contact_info(&state, ContactInfoKind::Phone).await? {
        let msg = SmsMessage::from(msg);
        let scope = msg.rate_limit_scope;
        let phone = PhoneNumber::parse(phone.0)?;
        state
            .sms_client
            .send_message(&state, msg.message_body, &phone, scope)
            .await?;
    } else if let Some(email) = vw.decrypt_contact_info(&state, ContactInfoKind::Email).await? {
        let msg = EmailMessage::from(msg);
        state
            .sendgrid_client
            .send_template(email.0, msg.template_id, msg.template_data)
            .await?;
    } else {
        return Err(UserError::NoContactInfoForUser.into());
    }

    ResponseData::ok(EmptyResponse {}).json()
}

fn validate(trigger_info: TriggerKind, scoped_vault: &ScopedVault) -> ApiResult<()> {
    match trigger_info {
        TriggerKind::RedoKyc => Ok(()),
        TriggerKind::IdDocument => Ok(()),
        TriggerKind::ProofOfSsn => match scoped_vault.status {
            Some(OnboardingStatus::Pass) | Some(OnboardingStatus::Fail) => Ok(()),
            None | Some(OnboardingStatus::Incomplete) | Some(OnboardingStatus::Pending) => {
                Err(UserError::NoCompleteOnboardings.into())
            }
        },
    }
}

#[derive(Clone)]
struct TriggerMessage {
    note: Option<String>,
    org_name: String,
    trigger_kind: TriggerKind,
    link: PiiString,
}

impl TriggerMessage {
    fn message_body(&self) -> PiiString {
        match self.trigger_kind {
            TriggerKind::RedoKyc => PiiString::from(format!(
                "{}Re-verify your identity for {} here: {}",
                self.note
                    .as_ref()
                    .map(|n| format!("{}\n\n", n))
                    .unwrap_or_default(),
                self.org_name,
                self.link.leak()
            )),
            TriggerKind::IdDocument => PiiString::from(format!(
                "{}To verify your identity for {}, provide a photo of your ID here: {}",
                self.note
                    .as_ref()
                    .map(|n| format!("{}\n\n", n))
                    .unwrap_or_default(),
                self.org_name,
                self.link.leak()
            )),
            TriggerKind::ProofOfSsn => PiiString::from(format!(
                "{}To verify your SSN for {}, provide a photo proof of SSN here: {}", // TODO: sketch
                self.note
                    .as_ref()
                    .map(|n| format!("{}\n\n", n))
                    .unwrap_or_default(),
                self.org_name,
                self.link.leak()
            )),
        }
    }
}

pub struct SmsMessage<'a> {
    pub message_body: PiiString,
    pub rate_limit_scope: &'a str,
}

pub struct EmailMessage<'a> {
    pub template_id: &'a str,
    pub template_data: HashMap<String, PiiString>,
}

impl<'a> From<TriggerMessage> for SmsMessage<'a> {
    fn from(value: TriggerMessage) -> Self {
        SmsMessage {
            message_body: value.message_body(),
            rate_limit_scope: api_core::utils::sms::rate_limit::DASHBOARD_TRIGGER,
        }
    }
}

impl<'a> From<TriggerMessage> for EmailMessage<'a> {
    fn from(value: TriggerMessage) -> Self {
        let TriggerMessage {
            org_name, note, link, ..
        } = value;
        let template_data = HashMap::from_iter(
            vec![
                Some(("org_name".to_string(), PiiString::from(org_name))),
                note.map(|n| ("note".to_string(), PiiString::from(n))),
                Some(("link".to_string(), link)),
            ]
            .into_iter()
            .flatten(),
        );

        EmailMessage {
            template_id: SendgridClient::TRIGGER_TEMPLATE_ID,
            template_data,
        }
    }
}
