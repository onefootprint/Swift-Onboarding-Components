use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::user::CheckedUserAuthContext;
use api_core::errors::ApiError;
use api_core::errors::ApiResult;
use api_core::telemetry::RootSpan;
use api_core::utils::challenge::ChallengeToken;
use api_core::utils::sms::PhoneEmailChallengeState;
use api_core::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use api_core::State;
use api_wire_types::IdentifyId;
use chrono::{DateTime, Duration, Utc};
use db::errors::OptionalExtension;
use db::models::contact_info::ContactInfo;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::ContactInfoKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::VaultId;
use paperclip::actix::{web, Apiv2Schema};
use strum::EnumDiscriminants;
use tracing::Instrument;
use webauthn_rs_core::proto::{AuthenticationState, Base64UrlSafeData};

#[allow(clippy::module_inception)]
pub mod identify;
pub mod login_challenge;
pub mod signup_challenge;
pub mod verify;

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

impl From<ContactInfoKind> for ChallengeKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Email => Self::Email,
            ContactInfoKind::Phone => Self::Sms,
        }
    }
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
pub enum ChallengeData {
    Sms(PhoneEmailChallengeState),
    #[serde(alias = "Biometric")] // TODO: drop this alias after challenges expire
    Passkey(BiometricChallengeState),
    Email(PhoneEmailChallengeState),
}

impl ChallengeState {
    pub fn expires_at(&self) -> DateTime<Utc> {
        let ttl = match &self.data {
            ChallengeData::Sms(_) => Duration::minutes(5),
            ChallengeData::Passkey(_) => Duration::minutes(5),
            ChallengeData::Email(_) => Duration::minutes(5),
        };

        Utc::now() + ttl
    }
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum VaultIdentifier {
    IdentifyId(IdentifyId, Option<SandboxId>),
    AuthenticatedId(CheckedUserAuthContext),
}
pub struct UserChallengeContext {
    vw: VaultWrapper<Person>,
    webauthn_creds: Vec<WebauthnCredential>,
    challenge_kinds: Vec<ChallengeKind>,
    is_unverified: bool,
}

#[allow(clippy::type_complexity)]
#[tracing::instrument(skip(state, root_span))]
async fn get_user_challenge_context(
    state: &web::Data<State>,
    identifier: VaultIdentifier,
    obc: Option<ObConfigAuth>,
    root_span: RootSpan,
) -> Result<Option<UserChallengeContext>, ApiError> {
    // Look up existing user vault by identifier
    let t_id = obc.as_ref().map(|obc| &obc.tenant().id);
    let (existing_user, sv_id) = match identifier {
        VaultIdentifier::IdentifyId(id, sandbox_id) => {
            let Some(existing_user) = state.find_vault(id, sandbox_id, t_id).await?  else {
                return Ok(None);
            };
            (existing_user, None)
        }
        VaultIdentifier::AuthenticatedId(auth) => (auth.user.clone(), auth.scoped_user_id()),
    };

    // Record some properties on the root span
    root_span.record("vault_id", existing_user.id.to_string());

    let (uvw, creds) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // Add some log fields to the root span. Prefer info from the sv_id, otherwise look
            // through the obc
            if let Some(sv_id) = sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                root_span.record("tenant_id", sv.tenant_id.to_string());
                root_span.record("is_live", sv.is_live);
                root_span.record("fp_id", sv.fp_id.to_string());
            } else if let Some(obc) = obc {
                root_span.record("tenant_id", obc.tenant().id.to_string());
                root_span.record("is_live", obc.ob_config().is_live);
                let t_id = &obc.tenant().id;
                // If there's already a SV for this (user, tenant) pair, log the fp_id
                if let Some(sv) = ScopedVault::get(conn, (&existing_user.id, t_id)).optional()? {
                    root_span.record("fp_id", sv.fp_id.to_string());
                }
            }

            let args = if let Some(sv_id) = sv_id.as_ref() {
                // If we have already identified a specific SV, create a UVW that sees all
                // speculative data for the tenant in order to see a speculative phone number
                // that was added by this tenant.
                VwArgs::Tenant(sv_id)
            } else {
                // Otherwise, create a UVW that only sees portable data
                VwArgs::Vault(&existing_user.id)
            };
            let uvw = VaultWrapper::build(conn, args)?;

            let creds = WebauthnCredential::list(conn, &uvw.vault.id)?;
            Ok((uvw, creds))
        })
        .await??;

    let ci = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
        .into_iter()
        .filter_map(|ci| uvw.get(IDK::from(ci)).map(|d| (ci, d.lifetime_id().clone())))
        .collect_vec();
    let cis = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            ci.into_iter()
                .map(|(ci, id)| -> ApiResult<_> { Ok((ci, ContactInfo::get(conn, &id)?)) })
                .collect::<ApiResult<Vec<_>>>()
        })
        .await??;

    let mut kinds = cis
        .iter()
        .filter(|(_, ci)| ci.is_otp_verified)
        .map(|(kind, _)| ChallengeKind::from(*kind))
        .collect_vec();
    if !creds.is_empty() {
        kinds.push(ChallengeKind::Biometric);
    }
    let is_unverified = kinds.is_empty()
        && uvw.vault.is_created_via_api
        && cis.iter().any(|(k, _)| *k == ContactInfoKind::Phone);
    if is_unverified {
        // If this is a non-portable vault with a phone, allow initiating a challenge to the phone
        // We would _only_ get here if an unauthed, identified token is passed into identify
        kinds.push(ContactInfoKind::Phone.into());
    }

    let ctx = UserChallengeContext {
        vw: uvw,
        webauthn_creds: creds,
        challenge_kinds: kinds,
        is_unverified,
    };
    Ok(Some(ctx))
}

pub fn send_email_challenge_non_blocking(
    state: &State,
    email: &Email,
    vault_id: VaultId,
    tenant: &Tenant,
    sandbox_id: Option<SandboxId>, // pointless pass through for now, but may use later with a fixture email
) -> ApiResult<ChallengeData> {
    // Send non-blocking to prevent us from returning the challenge data to the frontend while
    // we wait for sendrid latency
    let code = if tenant.id.is_integration_test_tenant() && sandbox_id.is_some() {
        // we can't currently view sent emails from our integration tests, so this temporarily allows us to still OTP emails from integration tests. sandbox check as a lil extra precaution
        "424242".to_owned()
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
            .send_email_otp_verify_email(email2, code, tenant_url)
            .await;
    };
    tokio::spawn(fut.in_current_span());

    Ok(ChallengeData::Email(PhoneEmailChallengeState {
        vault_id,
        h_code,
    }))
}
