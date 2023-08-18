#[allow(clippy::module_inception)]
pub mod identify;
pub mod login_challenge;
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use api_core::errors::ApiResult;
use api_core::fingerprinter::VaultIdentifier;
use api_core::utils::twilio::PhoneChallengeState;
use db::models::tenant::Tenant;
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::email::Email;
use newtypes::ContactInfoKind;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::TenantId;
use strum::EnumDiscriminants;
pub mod signup_challenge;
pub mod verify;
use crate::errors::ApiError;
use crate::utils::challenge::ChallengeToken;
use crate::State;
use chrono::{DateTime, Duration, Utc};
use newtypes::VaultId;
use paperclip::actix::{web, Apiv2Schema};
use webauthn_rs_core::proto::{AuthenticationState, Base64UrlSafeData};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum ChallengeKind {
    Sms,
    Biometric,
    Email,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    challenge_kind: ChallengeKind,
    challenge_token: ChallengeToken,
    scrubbed_phone_number: Option<PiiString>,
    biometric_challenge_json: Option<String>,
    time_before_retry_s: i64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: VaultId,
    #[serde(default)]
    pub non_synced_cred_ids: Vec<Base64UrlSafeData>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EmailChallengeState {
    pub email: PiiString,
    pub sandbox_id: Option<SandboxId>,
    pub h_code: Vec<u8>,
}

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(identify::post)
        .service(login_challenge::post)
        .service(signup_challenge::post)
        .service(verify::post);
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ChallengeState {
    data: ChallengeData,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, EnumDiscriminants)]
#[strum_discriminants(name(ChallengeDataKind))]
#[strum_discriminants(vis(pub))]
pub enum ChallengeData {
    Sms(PhoneChallengeState),
    Biometric(BiometricChallengeState),
    Email(EmailChallengeState),
}

impl ChallengeState {
    pub fn expires_at(&self) -> DateTime<Utc> {
        let ttl = match &self.data {
            ChallengeData::Sms(_) => Duration::minutes(5),
            ChallengeData::Biometric(_) => Duration::minutes(5),
            ChallengeData::Email(_) => Duration::minutes(5),
        };

        Utc::now() + ttl
    }
}

#[allow(clippy::type_complexity)]
#[tracing::instrument(skip(state))]
async fn get_user_challenge_context(
    state: &web::Data<State>,
    identifier: VaultIdentifier,
    t_id: Option<&TenantId>,
) -> Result<Option<(VaultWrapper<Person>, Vec<WebauthnCredential>, Vec<ChallengeKind>)>, ApiError> {
    // Look up existing user vault by identifier
    let existing_user = if let Some(existing_user) = state.find_vault(identifier, t_id).await? {
        existing_user
    } else {
        return Ok(None);
    };

    let (uvw, creds) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let uvw = VaultWrapper::build(conn, VwArgs::Vault(&existing_user.id))?;

            let creds = WebauthnCredential::get_for_user_vault(conn, &uvw.vault.id)?;
            Ok((uvw, creds))
        })
        .await??;

    let mut kinds: Vec<ChallengeKind> = Vec::new();

    if uvw
        .decrypt_contact_info(state, ContactInfoKind::Phone)
        .await?
        .map(|(_, ci)| ci.is_otp_verified)
        .unwrap_or(false)
    {
        kinds.push(ChallengeKind::Sms);
    }

    if uvw
        .decrypt_contact_info(state, ContactInfoKind::Email)
        .await?
        .map(|(_, ci)| ci.is_otp_verified)
        .unwrap_or(false)
    {
        kinds.push(ChallengeKind::Email);
    }

    if !creds.is_empty() {
        kinds.push(ChallengeKind::Biometric);
    }

    Ok(Some((uvw, creds, kinds)))
}

pub async fn send_email_challenge(
    state: &State,
    email: &Email,
    tenant: &Tenant,
    sandbox_id: Option<SandboxId>, // pointless pass through for now, but may use later with a fixture email
) -> ApiResult<ChallengeData> {
    // we can't currently view sent emails from our integration tests, so this temporarily allows us to still OTP emails from integration tests. sandbox check as a lil extra precaution
    let code = if tenant.id.is_integration_test_tenant() && sandbox_id.is_some() {
        "424242".to_owned()
    } else {
        crypto::random::gen_rand_n_digit_code(6)
    };

    let h_code = crypto::sha256(code.as_bytes()).to_vec();

    let tenant_url = tenant.website_url.as_ref().unwrap_or(&tenant.name); // better to default name here than error probably?

    state
        .sendgrid_client
        .send_email_otp_verify_email(email.email.clone(), code, tenant_url.to_string())
        .await?;

    Ok(ChallengeData::Email(EmailChallengeState {
        email: email.email.clone(),
        sandbox_id,
        h_code,
    }))
}
