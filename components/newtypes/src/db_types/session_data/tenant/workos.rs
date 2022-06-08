use crate::{
    db_types::session_data::{HeaderName, ServerSession, TypeError, UserVaultPermissions},
    TenantId,
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

#[derive(FromSqlRow, AsExpression, serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct WorkOsSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_id: TenantId,
}

impl TryFrom<ServerSession> for WorkOsSession {
    type Error = TypeError;

    fn try_from(value: ServerSession) -> Result<Self, Self::Error> {
        match value {
            ServerSession::WorkOs(data) => Ok(data),
            _ => Err(TypeError::BadSessionType),
        }
    }
}

impl HeaderName for WorkOsSession {
    fn header_name() -> String {
        "X-Fp-Dashboard-Authorization".to_owned()
    }
}

impl UserVaultPermissions for WorkOsSession {
    fn can_decrypt(&self) -> bool {
        true
    }

    fn can_modify(&self) -> bool {
        false
    }
}
