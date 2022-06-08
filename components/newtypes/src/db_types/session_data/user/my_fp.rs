use crate::{
    db_types::session_data::{HeaderName, ServerSession, TypeError},
    UserVaultId,
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct MyFootprintSession {
    pub user_vault_id: UserVaultId,
}

impl TryFrom<ServerSession> for MyFootprintSession {
    type Error = TypeError;

    fn try_from(value: ServerSession) -> Result<Self, Self::Error> {
        match value {
            ServerSession::MyFootprint(data) => Ok(data),
            _ => Err(TypeError::BadSessionType),
        }
    }
}

impl HeaderName for MyFootprintSession {
    fn header_name() -> String {
        "X-Footprint-Authorization".to_owned()
    }
}
