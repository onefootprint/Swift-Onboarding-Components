use super::{
    session_data::user::{ParsedUserSession, UserAuthScope, UserSession},
    AuthError, SessionContext,
};

/// A shorthand for the commonly used ParsedUserSession context
pub type UserAuth = SessionContext<ParsedUserSession>;

impl UserAuth {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_permissions(
        self,
        scopes: Vec<UserAuthScope>,
    ) -> Result<SessionContext<UserSession>, AuthError> {
        self.map(|c| c.check_permissions(scopes))
    }
}
