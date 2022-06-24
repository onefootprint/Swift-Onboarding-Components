use crate::{
    auth::{
        session_data::{HeaderName, SessionData, UserVaultPermissions},
        AuthError, session_context::HasUserVaultId,
    },
    errors::ApiError,
};
use newtypes::UserVaultId;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct OnboardingSession {
    pub user_vault_id: UserVaultId,
}

impl TryFrom<SessionData> for OnboardingSession {
    type Error = ApiError;

    fn try_from(value: SessionData) -> Result<Self, Self::Error> {
        match value {
            SessionData::Onboarding(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError)?,
        }
    }
}

impl HeaderName for OnboardingSession {
    fn header_name() -> String {
        "X-Fpuser-Authorization".to_owned()
    }
}

impl UserVaultPermissions for OnboardingSession {
    fn can_decrypt(&self) -> bool {
        false
    }

    fn can_update(&self) -> bool {
        true
    }
}

impl HasUserVaultId for OnboardingSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}