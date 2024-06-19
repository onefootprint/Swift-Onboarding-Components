use crate::auth::tenant::CheckTenantGuard;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::{
    TenantGuard,
    TenantSessionAuth,
};
use api_core::config::LinkKind;
use api_core::errors::user::UserError;
use api_core::errors::ApiResult;
use api_core::utils::email::SendgridClient;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::token::{
    create_token,
    CreateTokenArgs,
    CreateTokenResult,
};
use api_core::utils::vault_wrapper::{
    Any,
    TenantVw,
    VaultWrapper,
};
use api_wire_types::{
    CreateEntityTokenRequest,
    CreateEntityTokenResponse,
};
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use itertools::Itertools;
use newtypes::sms_message::SmsMessage;
use newtypes::{
    ContactInfoKind,
    DocumentRequestConfig,
    PhoneNumber,
    PiiString,
    WorkflowRequestConfig,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};
use std::collections::HashMap;

#[api_v2_operation(
    description = "Create an identified token for the provided fp_id and a link to the hosted flow that allows the user to complete the requested flow.",
    tags(Users, Private)
)]
#[post("/entities/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: Json<CreateEntityTokenRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<CreateEntityTokenResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let CreateEntityTokenRequest { kind, key, send_link } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    let (res, vw) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            let args = CreateTokenArgs {
                sv,
                kind,
                key,
                scopes: vec![],
                auth_events: vec![],
                limit_auth_methods: None,
            };
            let res = create_token(conn, &session_key, args, Duration::days(3))?;

            Ok((res, vw))
        })
        .await?;
    let CreateTokenResult { token, session, wfr } = res;

    let link_kind = LinkKind::from_token_kind(&kind);
    let link = state.config.service_config.generate_link(link_kind, &token);

    let delivery_method = if send_link {
        let org_name = auth.tenant().name.clone();
        send_communication(&state, vw, wfr, org_name, link.clone()).await?
    } else {
        None
    };

    let expires_at = session.expires_at;
    let response = CreateEntityTokenResponse {
        token,
        link,
        expires_at,
        delivery_method,
    };
    Ok(response)
}

async fn send_communication(
    state: &State,
    vw: TenantVw<Any>,
    wfr: Option<WorkflowRequest>,
    org_name: String,
    link: PiiString,
) -> ApiResult<Option<ContactInfoKind>> {
    let (kind, note) = if let Some(wfr) = wfr {
        let WorkflowRequest { note, config, .. } = wfr;
        let kind = match config {
            WorkflowRequestConfig::RedoKyc => TriggerMessageKind::RedoKyc,
            WorkflowRequestConfig::Onboard { .. } => TriggerMessageKind::Onboard,
            WorkflowRequestConfig::Document { configs } => TriggerMessageKind::Document { configs },
        };
        (kind, note)
    } else {
        (TriggerMessageKind::Auth, None)
    };
    let msg = TriggerMessage {
        note,
        org_name,
        kind,
        link,
    };

    let method = if let Some(phone) = vw.decrypt_contact_info(state, ContactInfoKind::Phone).await? {
        let msg = TokenSmsMessage::from(msg);
        let phone = PhoneNumber::parse(phone.0)?;
        let message = SmsMessage::Freeform {
            content: msg.message_body,
        };
        state.sms_client.send_message(state, message, phone).await?;
        Some(ContactInfoKind::Phone)
    } else if let Some(email) = vw.decrypt_contact_info(state, ContactInfoKind::Email).await? {
        let msg = TokenEmailMessage::from(msg);
        state
            .sendgrid_client
            .send_template(state, email.0, msg.template_id, msg.template_data)
            .await?;
        Some(ContactInfoKind::Email)
    } else {
        return Err(UserError::NoContactInfoForUser.into());
    };
    Ok(method)
}

struct TriggerMessage {
    note: Option<String>,
    org_name: String,
    kind: TriggerMessageKind,
    link: PiiString,
}

enum TriggerMessageKind {
    Auth,
    RedoKyc,
    Onboard,
    Document { configs: Vec<DocumentRequestConfig> },
}

fn message_for_documents(configs: &[DocumentRequestConfig], org_name: &str) -> String {
    match configs.first() {
        Some(config) if configs.len() == 1 => {
            let doc_type = match config {
                DocumentRequestConfig::Identity { .. } => "provide a photo of your ID.",
                DocumentRequestConfig::ProofOfAddress { .. } => "provide proof of your address.",
                DocumentRequestConfig::ProofOfSsn { .. } => "provide proof of your SSN.",
                DocumentRequestConfig::Custom { .. } => "upload a document.",
            };
            format!(
                "In order to verify your identity, {} has requested you {}",
                org_name, doc_type,
            )
        }
        _ => {
            format!(
                "In order to verify your identity, {} has requested you upload additional documentation.",
                org_name,
            )
        }
    }
}

impl TriggerMessageKind {
    fn sms_copy(&self, org_name: &str) -> String {
        match self {
            Self::Auth => {
                format!(
                    "{} has sent you a link to update your login information.",
                    org_name
                )
            }
            Self::RedoKyc => {
                format!("{} has requested you to re-verify your identity.", org_name)
            }
            Self::Onboard => {
                format!("{} has requested you to verify your identity.", org_name)
            }
            Self::Document { configs } => message_for_documents(configs, org_name),
        }
    }

    fn email_content(&self, org_name: &str) -> (String, String) {
        match self {
            Self::Auth => (
                "Update your login information".into(),
                format!(
                    "{} has sent you a link to update your login information.",
                    org_name
                ),
            ),
            Self::RedoKyc => (
                format!("{} has requested you to re-verify your identity", org_name),
                "Some of the information you have provided may be missing or incorrect. Please take a moment to re-verify your identity.".into()
            ),
            Self::Onboard => (
                format!("{} has requested you to verify your identity", org_name),
                "Some of the information you have provided may be missing or incorrect. Please take a moment to re-verify your identity.".into()
            ),
            Self::Document { configs } => {
                let body = message_for_documents(configs, org_name);
                ("Verify your identity".into(), body)
            }
        }
    }
}

pub struct TokenSmsMessage {
    pub message_body: PiiString,
}

pub struct TokenEmailMessage<'a> {
    pub template_id: &'a str,
    pub template_data: HashMap<String, PiiString>,
}

impl From<TriggerMessage> for TokenSmsMessage {
    fn from(value: TriggerMessage) -> Self {
        let message_body = PiiString::from(
            vec![
                value.note.as_ref(),
                Some(&value.kind.sms_copy(&value.org_name)),
                Some(&format!("Continue here: {}", value.link.leak())),
            ]
            .into_iter()
            .flatten()
            .join("\n\n"),
        );
        TokenSmsMessage { message_body }
    }
}

impl<'a> From<TriggerMessage> for TokenEmailMessage<'a> {
    fn from(value: TriggerMessage) -> Self {
        let TriggerMessage {
            org_name,
            note,
            link,
            kind,
        } = value;
        let (header, content) = kind.email_content(&org_name);
        let template_data = HashMap::from_iter(
            vec![
                Some(("header".to_string(), PiiString::from(header))),
                Some(("content".to_string(), PiiString::from(content))),
                Some(("org_name".to_string(), PiiString::from(org_name))),
                note.map(|n| ("note".to_string(), PiiString::from(n))),
                Some(("link".to_string(), link)),
            ]
            .into_iter()
            .flatten(),
        );

        TokenEmailMessage {
            template_id: SendgridClient::TRIGGER_TEMPLATE_ID,
            template_data,
        }
    }
}
