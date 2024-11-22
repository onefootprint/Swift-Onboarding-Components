use super::ParsedUserSessionContext;
use super::UserSessionContext;
use crate::auth::session::user::ContactInfoVerifySessionData;
use crate::auth::session::AllowSessionUpdate;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::utils::session::AuthSession;
use crate::FpResult;
use db::PgConn;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Async contact info verification token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for async verification of contact info."
)]
pub struct ContactInfoVerifySession {
    pub data: ContactInfoVerifySessionData,
    user_session: ParsedUserSessionContext,
}

impl std::ops::Deref for ContactInfoVerifySession {
    type Target = UserSessionContext;

    fn deref(&self) -> &Self::Target {
        &self.user_session.0
    }
}

impl ExtractableAuthSession for ContactInfoVerifySession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        conn: &mut PgConn,
        value: AuthSessionData,
        ctx: LoadSessionContext,
    ) -> FpResult<Self> {
        let data = match value {
            AuthSessionData::ContactInfoVerify(data) => data,
            _ => return Err(AuthError::SessionTypeError.into()),
        };
        let ContactInfoVerifySessionData { user_token, .. } = &data;
        let user_session = AuthSession::get(conn, &ctx.sealing_key, user_token)?;
        let user_session = ParsedUserSessionContext::try_load_session(conn, user_session.data, ctx)?;

        Ok(ContactInfoVerifySession { user_session, data })
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        self.user_session.log_authed_principal(root_span)
    }
}

pub type ContactInfoVerifyAuth = SessionContext<ContactInfoVerifySession>;

// Allow calling SessionContext<ContactInfoVerifySession>::update
impl AllowSessionUpdate for SessionContext<ContactInfoVerifySession> {}
