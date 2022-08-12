pub mod challenge;
#[allow(clippy::module_inception)]
pub mod identify;
pub mod verify;
use chrono::{DateTime, Duration, Utc};
use newtypes::{UserVaultId, ValidatedPhoneNumber};
use paperclip::actix::{web, Apiv2Schema};
use webauthn_rs_core::proto::AuthenticationState;

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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneChallengeState {
    pub phone_number: ValidatedPhoneNumber,
    pub h_code: Vec<u8>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: UserVaultId,
}

pub fn routes() -> web::Scope {
    web::scope("/identify")
        .service(web::resource("").route(web::post().to(identify::handler)))
        .service(challenge::handler)
        .service(verify::handler)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IdentifyChallengeState {
    identify_type: IdentifyType,
    data: IdentifyChallengeData,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, PartialEq, Clone, Copy, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyType {
    Unspecified,
    Onboarding,
    My1fp,
}

impl Default for IdentifyType {
    fn default() -> Self {
        Self::Unspecified
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum IdentifyChallengeData {
    Sms(PhoneChallengeState),
    Biometric(BiometricChallengeState),
}

impl IdentifyChallengeState {
    pub fn expires_at(&self) -> DateTime<Utc> {
        let ttl = match &self.data {
            IdentifyChallengeData::Sms(_) => Duration::minutes(5),
            IdentifyChallengeData::Biometric(_) => Duration::minutes(5),
        };

        Utc::now() + ttl
    }
}
