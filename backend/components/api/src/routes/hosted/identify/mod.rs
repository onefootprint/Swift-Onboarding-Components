#[allow(clippy::module_inception)]
pub mod identify;
pub mod login_challenge;
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use db::models::webauthn_credential::WebauthnCredential;
pub mod signup_challenge;
pub mod verify;
use crate::errors::ApiError;
use crate::utils::challenge::ChallengeToken;
use crate::State;
use chrono::{DateTime, Duration, Utc};
use db::models::user_vault::UserVault;
use newtypes::email::Email;
use newtypes::UserVaultId;
use newtypes::{Fingerprinter, PiiString};
use newtypes::{IdentityDataKind, PhoneNumber};
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
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    challenge_kind: ChallengeKind,
    challenge_token: ChallengeToken,
    scrubbed_phone_number: String,
    biometric_challenge_json: Option<String>,
    time_before_retry_s: i64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneChallengeState {
    /// Will also include sandbox suffix, if exists
    pub phone_number_e164_with_suffix: PiiString,
    pub h_code: Vec<u8>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: UserVaultId,
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

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Identifier {
    Email(Email),
    PhoneNumber(PhoneNumber),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ChallengeData {
    Sms(PhoneChallengeState),
    Biometric(BiometricChallengeState),
}

impl ChallengeState {
    pub fn expires_at(&self) -> DateTime<Utc> {
        let ttl = match &self.data {
            ChallengeData::Sms(_) => Duration::minutes(5),
            ChallengeData::Biometric(_) => Duration::minutes(5),
        };

        Utc::now() + ttl
    }
}

#[tracing::instrument(skip(state))]
async fn get_user_by_identifier(
    state: &web::Data<State>,
    identifier: &Identifier,
) -> Result<Option<UserVault>, ApiError> {
    let (data_attribute, data) = match identifier {
        Identifier::PhoneNumber(phone_number) => {
            (IdentityDataKind::PhoneNumber, phone_number.e164_with_suffix())
        }
        Identifier::Email(email) => (IdentityDataKind::Email, PiiString::from(email.clone())),
    };
    let sh_data = state
        .compute_fingerprint(data_attribute, data.clean_for_fingerprint())
        .await?;
    // TODO should we only look for verified emails?
    let existing_user = state
        .db_pool
        .db_query(|conn| UserVault::find_portable(conn, sh_data))
        .await??;
    Ok(existing_user)
}

#[tracing::instrument(skip(state))]
async fn get_user_challenge_context(
    state: &web::Data<State>,
    identifier: &Identifier,
) -> Result<Option<(VaultWrapper<Person>, Vec<WebauthnCredential>, Vec<ChallengeKind>)>, ApiError> {
    // Look up existing user vault by identifier
    let existing_user = if let Some(existing_user) = get_user_by_identifier(state, identifier).await? {
        existing_user
    } else {
        return Ok(None);
    };

    let (uvw, creds) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let uvw = VaultWrapper::build(conn, VwArgs::User(&existing_user.id))?;
            let creds = WebauthnCredential::get_for_user_vault(conn, &uvw.user_vault.id)?;
            Ok((uvw, creds))
        })
        .await??;

    let mut kinds: Vec<ChallengeKind> = Vec::new();
    if uvw.has_identity_field(IdentityDataKind::PhoneNumber) {
        kinds.push(ChallengeKind::Sms);
    }
    if !creds.is_empty() {
        kinds.push(ChallengeKind::Biometric);
    }

    Ok(Some((uvw, creds, kinds)))
}
