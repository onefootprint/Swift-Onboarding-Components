use std::collections::HashMap;

use crate::{
    auth::tenant::CheckTenantGuard,
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    auth::tenant::{TenantGuard, TenantSessionAuth},
    config::LinkKind,
    errors::{user::UserError, ApiResult},
    utils::{
        challenge_rate_limit::RateLimit,
        email::SendgridClient,
        fp_id_path::FpIdPath,
        token::{create_token, CreateTokenArgs, CreateTokenResult},
        vault_wrapper::{Any, TenantVw, VaultWrapper},
    },
};
use api_wire_types::{CreateEntityTokenRequest, CreateEntityTokenResponse};
use chrono::Duration;
use db::models::{scoped_vault::ScopedVault, workflow_request::WorkflowRequest};
use itertools::Itertools;
use newtypes::{
    sms_message::SmsMessage, ContactInfoKind, DocumentRequestKind, PhoneNumber, PiiString,
    WorkflowRequestConfig,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

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
                is_implied_auth: false,
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
    ResponseData::ok(response).json()
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
            WorkflowRequestConfig::IdDocument {
                kind,
                collect_selfie: _,
            } => match kind {
                DocumentRequestKind::Identity => TriggerMessageKind::IdentityDocument,
                DocumentRequestKind::ProofOfAddress => TriggerMessageKind::ProofOfAddress,
                DocumentRequestKind::ProofOfSsn => TriggerMessageKind::ProofOfSsn,
            },
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
        let scope = msg.rate_limit_scope;
        let phone = PhoneNumber::parse(phone.0)?;
        let message = SmsMessage::Freeform {
            content: msg.message_body,
        };
        state
            .sms_client
            .send_message(state, message, &phone, scope)
            .await?;
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
    IdentityDocument,
    ProofOfAddress,
    ProofOfSsn,
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
            Self::IdentityDocument => {
                format!(
                    "In order to verify your identity, {} has requested you provide a photo of your ID.",
                    org_name
                )
            }
            Self::ProofOfAddress => {
                format!(
                    "In order to verify your address, {} has requested you provide proof of your address.",
                    org_name
                )
            }
            Self::ProofOfSsn => {
                format!(
                    "In order to verify your identity, {} has requested you provide proof of your SSN.",
                    org_name
                )
            }
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
            Self::IdentityDocument => (
                "Verify your identity".into(),
                format!(
                    "In order to verify your identity, {} has requested you provide a photo of your ID.",
                    org_name
                )
            ),
            Self::ProofOfAddress => (
                "Verify your identity".into(),
                format!(
                    "In order to verify your address, {} has requested you provide proof of your address.",
                    org_name
                )
            ),
            Self::ProofOfSsn => (
                "Verify your identity".into(),
                format!(
                    "In order to verify your identity, {} has requested you provide proof of your SSN.",
                    org_name
                )
            )
        }
    }
}

pub struct TokenSmsMessage<'a> {
    pub message_body: PiiString,
    pub rate_limit_scope: &'a str,
}

pub struct TokenEmailMessage<'a> {
    pub template_id: &'a str,
    pub template_data: HashMap<String, PiiString>,
}

impl<'a> From<TriggerMessage> for TokenSmsMessage<'a> {
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
        TokenSmsMessage {
            message_body,
            rate_limit_scope: RateLimit::DASHBOARD_TRIGGER,
        }
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
