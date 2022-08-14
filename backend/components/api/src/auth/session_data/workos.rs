use crate::{
    auth::{AuthError, ExtractableAuthSession, HasTenant, Principal, SupportsIsLiveHeader},
    errors::ApiError,
};
use async_trait::async_trait;
use newtypes::TenantId;
use paperclip::actix::Apiv2Schema;

use super::AuthSessionData;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct WorkOsSession {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub tenant_id: TenantId,
    pub sandbox_restricted: bool,
}

impl TryFrom<AuthSessionData> for WorkOsSession {
    type Error = ApiError;

    fn try_from(value: AuthSessionData) -> Result<Self, Self::Error> {
        match value {
            AuthSessionData::WorkOs(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl ExtractableAuthSession for WorkOsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }
}

#[async_trait]
impl HasTenant for WorkOsSession {
    fn tenant_id(&self) -> TenantId {
        self.tenant_id.clone()
    }

    fn is_sandbox_restricted(&self) -> bool {
        self.sandbox_restricted
    }
}

impl Principal for WorkOsSession {
    fn format_principal(&self) -> String {
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

impl SupportsIsLiveHeader for WorkOsSession {}
