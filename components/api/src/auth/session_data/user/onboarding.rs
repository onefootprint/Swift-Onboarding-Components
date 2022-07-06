use crate::{
    auth::{
        session_context::HasUserVaultId,
        session_data::{HeaderName, SessionData},
        uv_permission::{HasVaultPermission, VaultPermission},
        AuthError,
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
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl HeaderName for OnboardingSession {
    fn header_name() -> String {
        "X-Fpuser-Authorization".to_owned()
    }
}

impl HasVaultPermission for OnboardingSession {
    fn has_permission(&self, permission: VaultPermission) -> bool {
        use VaultPermission::*;
        // TODO: disable this once we support the 'Add only' permission!
        matches!(permission, Update(_) | AddBiometrics)
    }
}

impl HasUserVaultId for OnboardingSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}
