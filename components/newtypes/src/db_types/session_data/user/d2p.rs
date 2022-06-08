use crate::UserVaultId;
use crate::{
    db_types::session_data::{HeaderName, ServerSession, TypeError},
    D2pSessionStatus,
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

#[derive(
    Default, FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema,
)]
pub struct D2pSession {
    pub user_vault_id: UserVaultId,
    pub status: D2pSessionStatus,
}

impl TryFrom<ServerSession> for D2pSession {
    type Error = TypeError;

    fn try_from(value: ServerSession) -> Result<Self, Self::Error> {
        match value {
            ServerSession::D2p(data) => Ok(data),
            _ => Err(TypeError::BadSessionType),
        }
    }
}

impl HeaderName for D2pSession {
    fn header_name() -> String {
        "X-D2P-Authorization".to_owned()
    }
}
