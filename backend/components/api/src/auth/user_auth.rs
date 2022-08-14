use super::{
    session_data::user::{ParsedUserSession, UserAuthScope, UserSession},
    AuthError, SessionContext,
};

/// A shorthand for the commonly used ParsableUserSession context
pub type UserAuth = SessionContext<ParsedUserSession>;

impl UserAuth {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_permissions(
        self,
        scopes: Vec<UserAuthScope>,
    ) -> Result<SessionContext<UserSession>, AuthError> {
        let SessionContext {
            data,
            auth_token,
            expires_at,
            headers,
            phantom,
        } = self;
        let result = SessionContext {
            data: data.check_permissions(scopes)?,
            auth_token,
            expires_at,
            headers,
            phantom,
        };
        Ok(result)
    }
}
