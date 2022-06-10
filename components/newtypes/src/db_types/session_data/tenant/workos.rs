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

impl WorkOsSession {
    pub fn format_principal(&self) -> String {
        // Show "Name (email)" as the principal if the name is set, otherwise just email
        let name = match (&self.first_name, &self.last_name) {
            (Some(first_name), Some(last_name)) => Some(format!("{} {}", first_name, last_name)),
            (Some(name), None) | (None, Some(name)) => Some(name.clone()),
            (None, None) => None,
        };
        match name {
            Some(name) => format!("{} ({})", name, self.email),
            None => self.email.clone(),
        }
    }
}
