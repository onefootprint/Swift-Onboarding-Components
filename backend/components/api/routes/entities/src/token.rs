use std::collections::HashMap;

use crate::auth::tenant::CheckTenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::config::LinkKind;
use api_core::errors::user::UserError;
use api_core::errors::ApiResult;
use api_core::utils::challenge_rate_limit::RateLimit;
use api_core::utils::email::SendgridClient;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::token::create_token;
use api_core::utils::token::CreateTokenArgs;
use api_core::utils::token::CreateTokenResult;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::CreateEntityTokenRequest;
use api_wire_types::CreateEntityTokenResponse;
use api_wire_types::EntityTokenOperationKind;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use itertools::Itertools;
use newtypes::ContactInfoKind;
use newtypes::DocumentRequestKind;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::WorkflowRequestConfig;
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

    let token_kind = match kind {
        EntityTokenOperationKind::Inherit => TokenOperationKind::Inherit,
        EntityTokenOperationKind::UpdateAuthMethods => TokenOperationKind::User,
    };
    let link_kind = match kind {
        EntityTokenOperationKind::Inherit => LinkKind::VerifyUser,
        EntityTokenOperationKind::UpdateAuthMethods => LinkKind::UpdateAuth,
    };

    let (res, vw) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            let args = CreateTokenArgs {
                sv,
                kind: token_kind,
                key,
                scopes: vec![],
                auth_events: vec![],
                is_implied_auth: false,
            };
            let res = create_token(conn, &session_key, args, Duration::days(3))?;

            Ok((res, vw))
        })
        .await?;
    let CreateTokenResult { token, session, wfr } = res;
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

pub(super) async fn send_communication(
    state: &State,
    vw: TenantVw<Any>,
    wfr: Option<WorkflowRequest>,
    org_name: String,
    link: PiiString,
) -> ApiResult<Option<ContactInfoKind>> {
    let msg = if let Some(wfr) = wfr {
        TriggerMessage::for_wfr(wfr, org_name, link)
    } else {
        TriggerMessage::for_auth(org_name, link)
    };

    let method = if let Some(phone) = vw.decrypt_contact_info(state, ContactInfoKind::Phone).await? {
        let msg = SmsMessage::from(msg);
        let scope = msg.rate_limit_scope;
        let phone = PhoneNumber::parse(phone.0)?;
        state
            .sms_client
            .send_message(state, msg.message_body, &phone, scope)
            .await?;
        Some(ContactInfoKind::Phone)
    } else if let Some(email) = vw.decrypt_contact_info(state, ContactInfoKind::Email).await? {
        let msg = EmailMessage::from(msg);
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

#[derive(Clone)]
struct TriggerMessage {
    note: Option<String>,
    org_name: String,
    context_message: String,
    link: PiiString,
}

impl TriggerMessage {
    fn for_auth(org_name: String, link: PiiString) -> Self {
        let context_message = format!(
            "{} has sent you a link to update your login information.",
            org_name
        );
        Self {
            note: None,
            org_name,
            context_message,
            link,
        }
    }

    fn for_wfr(wfr: WorkflowRequest, org_name: String, link: PiiString) -> Self {
        let WorkflowRequest { note, config, .. } = wfr;
        let context_message = match config {
            WorkflowRequestConfig::RedoKyc => {
                format!("{} has requested you to re-verify your identity.", org_name)
            }
            WorkflowRequestConfig::IdDocument {
                kind,
                collect_selfie: _,
            } => {
                match kind {
                    DocumentRequestKind::Identity => {
                        format!("In order to verify your identity, {} has requested you provide a photo of your ID.", org_name)
                    }
                    DocumentRequestKind::ProofOfAddress => {
                        format!(
                            "In order to verify your address, {} has requested you provide proof of address.",
                            org_name
                        )
                    }
                    DocumentRequestKind::ProofOfSsn => {
                        format!(
                            "In order to verify your identity, {} has requested you provide proof of SSN.",
                            org_name
                        )
                    }
                }
            }
        };
        Self {
            note,
            org_name,
            context_message,
            link,
        }
    }
}

impl TriggerMessage {
    fn message_body(&self) -> PiiString {
        PiiString::from(
            vec![
                self.note.as_ref(),
                Some(&self.context_message),
                Some(&format!("Continue here: {}", self.link.leak())),
            ]
            .into_iter()
            .flatten()
            .join("\n\n"),
        )
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
            rate_limit_scope: RateLimit::DASHBOARD_TRIGGER,
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
                Some((
                    "header".to_string(),
                    PiiString::from(format!(
                        "{} has requested you to re-verify your identity",
                        org_name
                    )),
                )),
                Some(("content".to_string(), PiiString::from("Some of the information you have provided may be missing or incorrect. Please take a moment to re-verify your identity."))),
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
