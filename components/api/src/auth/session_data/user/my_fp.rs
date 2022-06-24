use newtypes::UserVaultId;
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session_context::HasUserVaultId,
        session_data::{HeaderName, SessionData, UserVaultPermissions},
        AuthError,
    },
    errors::ApiError,
};

/// A basic My1Fp session with limited permissions
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct My1fpBasicSession {
    pub user_vault_id: UserVaultId,
    pub auth_method: UserAuthMethod,
}

impl TryFrom<SessionData> for My1fpBasicSession {
    type Error = ApiError;

    fn try_from(value: SessionData) -> Result<Self, Self::Error> {
        match value {
            SessionData::My1fp(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError)?,
        }
    }
}

impl HeaderName for My1fpBasicSession {
    fn header_name() -> String {
        "X-My1fp-Authorization".to_owned()
    }
}

impl UserVaultPermissions for My1fpBasicSession {
    fn can_decrypt(&self) -> bool {
        false
    }

    fn can_update(&self) -> bool {
        true
    }
}

impl HasUserVaultId for My1fpBasicSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[serde(rename = "snake_case")]
pub enum UserAuthMethod {
    SmsOnly,
    BiometricsOnly,
    SmsAndBiometrics,
    SmsAndEmail,
}

/// A stepped up My1Fp session with full permissions
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct My1fpStepUpSession {
    pub user_vault_id: UserVaultId,
    pub auth_method: StepUpAuthMethod,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[serde(rename = "snake_case")]
pub enum StepUpAuthMethod {
    BiometricsOnly,
    SmsAndBiometrics,
    SmsAndEmail,
}

impl HeaderName for My1fpStepUpSession {
    fn header_name() -> String {
        "X-My1fp-Authorization".to_owned()
    }
}
