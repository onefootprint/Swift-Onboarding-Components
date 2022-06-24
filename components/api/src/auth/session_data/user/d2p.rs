use newtypes::{D2pSessionStatus, UserVaultId};
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session_data::{HeaderName, SessionData},
        AuthError, session_context::HasUserVaultId,
    },
    errors::ApiError,
};

#[derive(Default, serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct D2pSession {
    pub user_vault_id: UserVaultId,
    pub status: D2pSessionStatus,
}

impl TryFrom<SessionData> for D2pSession {
    type Error = ApiError;

    fn try_from(value: SessionData) -> Result<Self, Self::Error> {
        match value {
            SessionData::D2p(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError)?,
        }
    }
}

impl HeaderName for D2pSession {
    fn header_name() -> String {
        "X-D2P-Authorization".to_owned()
    }
}

impl HasUserVaultId for D2pSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}