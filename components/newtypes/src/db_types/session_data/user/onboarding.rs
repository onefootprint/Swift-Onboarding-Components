use crate::{
    db_types::session_data::{HeaderName, ServerSession, TypeError, UserVaultPermissions},
    UserVaultId,
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct OnboardingSession {
    pub user_vault_id: UserVaultId,
}

impl TryFrom<ServerSession> for OnboardingSession {
    type Error = TypeError;

    fn try_from(value: ServerSession) -> Result<Self, Self::Error> {
        match value {
            ServerSession::Onboarding(data) => Ok(data),
            _ => Err(TypeError::BadSessionType),
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

    fn can_modify(&self) -> bool {
        true
    }
}
