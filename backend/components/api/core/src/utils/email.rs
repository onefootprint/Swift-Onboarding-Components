use super::challenge_rate_limit::RateLimit;
use super::session::AuthSession;
use super::sms::PhoneEmailChallengeState;
use crate::auth::session::user::EmailVerifySession;
use crate::auth::session::AuthSessionData;
use crate::errors::user::UserError;
use crate::errors::ApiErrorKind;
use crate::errors::ApiResult;
use crate::State;
use chrono::Duration;
use crypto::random::gen_random_alphanumeric_code;
use db::models::tenant::Tenant;
use feature_flag::BoolFlag;
use newtypes::email::Email;
use newtypes::ContactInfoId;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::TenantId;
use newtypes::VaultId;
use paperclip::actix::web;
use reqwest::StatusCode;
use reqwest_middleware::ClientWithMiddleware;
use reqwest_tracing::TracingMiddleware;
use std::collections::HashMap;
use std::str::FromStr;
use tracing::Instrument;

#[derive(Debug, Clone)]
pub struct SendgridClient {
    api_key: String,
    client: ClientWithMiddleware,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridRequest {
    personalizations: Vec<SendgridPersonalization>,
    from: SendgridEmail,
    subject: String,
    content: Vec<SendgridContent>,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridTemplateRequest {
    personalizations: Vec<SendgridPersonalization>,
    from: SendgridEmail,
    template_id: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridPersonalization {
    to: Vec<SendgridEmail>,
    dynamic_template_data: HashMap<String, String>,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridEmail {
    email: String,
    name: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridContent {
    #[serde(rename(serialize = "type"))]
    type_: String,
    value: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct SendgridErrors {
    errors: Vec<SendgridErrorFieldAndMessage>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct SendgridErrorFieldAndMessage {
    field: Option<String>,
    message: String,
}

pub struct BoInviteEmailInfo<'a> {
    pub to_email: PiiString,
    pub inviter: &'a PiiString,
    /// The name of the business being verified
    pub business_name: &'a PiiString,
    /// The tenant name
    pub org_name: &'a str,
    pub logo_url: Option<String>,
    pub url: PiiString,
}

impl SendgridClient {
    const DASHBOARD_INVITE_TEMPLATE_ID: &'static str = "d-74de0508a7834a2494c499d2a70c41ba";
    const EMAIL_VERIFY_TEMPLATE_ID: &'static str = "d-c558e640dad04726a31e6710c7ffc57c";
    const FROM_EMAIL: &'static str = "noreply@noreply.onefootprint.com";
    const FROM_NAME: &'static str = "Footprint";
    const KYC_BUSINESS_OWNER_TEMPLATE_ID: &'static str = "d-104270bd3b7c4c62a6ed95e295c7822b";
    const MAGIC_LINK_TEMPLATE_ID: &'static str = "d-a631e0eb72984e28a39940aa8f3bbe60";
    const OTP_VERIFY_TEMPLATE_ID: &'static str = "d-d4707e4a976449e1af1753de5f05289d";
    pub const TRIGGER_TEMPLATE_ID: &'static str = "d-d1319538747c4a86a9ad28ff35767896";

    pub fn new(api_key: String) -> Self {
        let client = reqwest::Client::new();
        let client = reqwest_middleware::ClientBuilder::new(client)
            .with(TracingMiddleware::default())
            .build();
        Self { api_key, client }
    }

    pub async fn send_magic_link_email(
        &self,
        state: &State,
        to_email: String,
        url: PiiString,
    ) -> ApiResult<()> {
        let template_data = HashMap::from([("curl_request".to_string(), url)]);
        self.send_template(
            state,
            PiiString::from(to_email),
            Self::MAGIC_LINK_TEMPLATE_ID,
            template_data,
        )
        .await
    }

    pub async fn send_dashboard_invite_email(
        &self,
        state: &State,
        to_email: String,
        inviter: String,
        org_name: String,
        accept_url: PiiString,
    ) -> ApiResult<()> {
        let to_email = PiiString::from(to_email);
        let template_data = HashMap::from([
            ("recipient_email".to_string(), to_email.clone()),
            ("inviter".to_string(), PiiString::from(inviter)),
            ("org_name".to_string(), PiiString::from(org_name)),
            ("accept_url".to_string(), accept_url),
        ]);
        self.send_template(state, to_email, Self::DASHBOARD_INVITE_TEMPLATE_ID, template_data)
            .await
    }

    pub async fn send_email_verify_email(
        &self,
        state: &State,
        to_email: PiiString,
        curl_url: PiiString,
    ) -> ApiResult<()> {
        let template_data = HashMap::from([("curl_request".to_string(), curl_url)]);
        self.send_template(state, to_email, Self::EMAIL_VERIFY_TEMPLATE_ID, template_data)
            .await
    }

    pub async fn send_business_owner_invite<'a>(
        &self,
        state: &State,
        info: BoInviteEmailInfo<'a>,
    ) -> ApiResult<()> {
        let BoInviteEmailInfo {
            to_email,
            inviter,
            business_name,
            org_name,
            logo_url,
            url,
        } = info;
        let d = HashMap::from_iter(
            vec![
                Some(("recipient_email".to_string(), to_email.clone())),
                Some(("inviter".to_string(), inviter.clone())),
                Some(("business_name".to_string(), business_name.clone())),
                Some(("flow_url".to_string(), url)),
                Some(("org_name".to_string(), PiiString::from(org_name.to_string()))),
                Some((
                    "org_name_first_char".to_string(),
                    PiiString::from(
                        org_name
                            .chars()
                            .next()
                            .unwrap_or_default()
                            .to_uppercase()
                            .to_string(),
                    ),
                )),
                // TODO need to handle no logo
                logo_url.map(|u| ("logo_url".to_string(), PiiString::from(u))),
            ]
            .into_iter()
            .flatten(),
        );
        self.send_template(state, to_email, Self::KYC_BUSINESS_OWNER_TEMPLATE_ID, d)
            .await
    }

    #[tracing::instrument(skip_all, err)]
    pub async fn send_email_otp_verify_email(
        &self,
        state: &State,
        to_email: PiiString,
        code: String,
        tenant_url: String,
    ) -> ApiResult<()> {
        let template_data = HashMap::from([
            ("code".to_string(), code.into()),
            ("tenant_url".to_string(), tenant_url.into()),
        ]);
        self.send_template(state, to_email, Self::OTP_VERIFY_TEMPLATE_ID, template_data)
            .await
    }

    #[tracing::instrument(skip_all)]
    pub async fn send_template(
        &self,
        state: &State,
        to_email: PiiString,
        template_id: &str,
        template_data: HashMap<String, PiiString>,
    ) -> ApiResult<()> {
        if Email::from_str(to_email.leak())
            .ok()
            .is_some_and(|e| e.is_fixture())
        {
            // Don't rate limit or send emails to the fixture email
            return Ok(());
        }
        RateLimit {
            key: &to_email,
            period: Duration::seconds(state.config.time_s_between_challenges),
            scope: template_id,
        }
        .enforce_and_update(state)
        .await?;
        let template_data = template_data
            .into_iter()
            .map(|(k, v)| (k, v.leak_to_string()))
            .collect();
        let req = SendgridTemplateRequest {
            personalizations: vec![SendgridPersonalization {
                to: vec![SendgridEmail {
                    email: to_email.leak_to_string(),
                    name: None,
                }],
                dynamic_template_data: template_data,
            }],
            from: SendgridEmail {
                email: Self::FROM_EMAIL.to_owned(),
                name: Some(Self::FROM_NAME.to_owned()),
            },
            template_id: template_id.to_string(),
        };
        let res = self
            .client
            .post("https://api.sendgrid.com/v3/mail/send")
            .bearer_auth(self.api_key.clone())
            .header("content-type", "application/json")
            .json(&req)
            .send()
            .await?;

        if res.status().eq(&StatusCode::ACCEPTED) {
            return Ok(());
        }

        let err = &res.text().await?;
        Err(ApiErrorKind::SendgridError(err.to_owned()))?
    }
}

pub async fn send_email_challenge(
    state: &web::Data<State>,
    tenant_id: &TenantId,
    email_id: ContactInfoId,
    email_address: &PiiString,
) -> ApiResult<()> {
    // Some tenants don't ever want to verify email
    // TODO we'll want to ignore this on no-phone OBCs
    let omit_email_verification = state.ff_client.flag(BoolFlag::OmitEmailVerification(tenant_id));
    if omit_email_verification {
        return Ok(());
    }
    let session_data = AuthSessionData::EmailVerify(EmailVerifySession { email_id });

    // create new session
    let token = AuthSession::create(state, session_data, chrono::Duration::days(30)).await?;

    // add unique url query param to avoid incorrect caching by browser/client
    let unique_param = gen_random_alphanumeric_code(5);
    let base_url = if state.config.service_config.is_production() {
        "https://confirm.onefootprint.com"
    } else if state.config.service_config.is_local() {
        "http://localhost:3006"
    } else {
        "https://confirm.preview.onefootprint.com"
    };
    let confirm_link_str = PiiString::from(format!("{}/?v={}#{}", base_url, unique_param, token));
    state
        .sendgrid_client
        .send_email_verify_email(state, email_address.clone(), confirm_link_str)
        .await?;
    Ok(())
}

pub fn send_email_challenge_non_blocking(
    state: &State,
    email: &Email,
    vault_id: VaultId,
    tenant: &Tenant,
    sandbox_id: Option<SandboxId>, // pointless pass through for now, but may use later with a fixture email
) -> ApiResult<PhoneEmailChallengeState> {
    // Send non-blocking to prevent us from returning the challenge data to the frontend while
    // we wait for sendrid latency
    if email.is_fixture() && sandbox_id.is_none() {
        return Err(UserError::FixtureCIInLive.into());
    }
    let code = if email.is_fixture() {
        "000000".to_owned()
    } else {
        crypto::random::gen_rand_n_digit_code(6)
    };

    let h_code = crypto::sha256(code.as_bytes()).to_vec();

    let tenant_url = tenant.website_url.as_ref().unwrap_or(&tenant.name).to_owned(); // better to default name here than error probably?

    let state = state.clone();
    let email2 = email.email.clone();
    let fut = async move {
        let _ = state
            .sendgrid_client
            .send_email_otp_verify_email(&state, email2, code, tenant_url)
            .await;
    };
    tokio::spawn(fut.in_current_span());

    Ok(PhoneEmailChallengeState { vault_id, h_code })
}
