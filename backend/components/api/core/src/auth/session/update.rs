use super::AuthSessionData;
use crate::{auth::Either, errors::ApiResult, utils::session::AuthSession};
use crypto::aead::ScopedSealingKey;
use db::PgConn;

/// Marker trait for Ts wrapped by SessionContext<T>. When this trait is implemented for T,
/// you'll be able to call SessionContext<T>.update_session(...) to transparently replace the
/// session data for this auth token
pub trait AllowSessionUpdate {}

pub trait GetSessionForUpdate {
    fn session(self) -> AuthSession;
}

impl<A, B> GetSessionForUpdate for Either<A, B>
where
    A: GetSessionForUpdate,
    B: GetSessionForUpdate,
{
    fn session(self) -> AuthSession {
        match self {
            Either::Left(l) => l.session(),
            Either::Right(r) => r.session(),
        }
    }
}

pub trait UpdateSession {
    /// Replace the session data for the session used to authenticate this SessionContext with the
    /// new provided data
    fn update_session(
        self, // Intentionally consume to prevent reading stale value
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> ApiResult<()>;
}

impl<T> UpdateSession for T
where
    T: GetSessionForUpdate,
{
    fn update_session(
        self, // Intentionally consume to prevent reading stale value
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> ApiResult<()> {
        self.session().update(conn, session_sealing_key, data)?;
        Ok(())
    }
}
