use db::PgConnection;
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        AuthError,
    },
    errors::ApiResult,
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct WorkOsSession {
    /// The email that was proven to be owned by WorkOs auth.
    pub email: String,
    // TODO first name and last name?
    // TODO make this tenant user id instead of email since there's only one user per email
}

impl ExtractableAuthSession for WorkOsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Dashboard-Authorization"]
    }

    fn try_from(auth_session: AuthSessionData, _conn: &mut PgConnection) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::WorkOs(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        Ok(data)
    }
}

impl AllowSessionUpdate for WorkOsSession {}
