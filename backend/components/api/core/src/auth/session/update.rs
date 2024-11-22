use super::AuthSessionData;
use crate::auth::Either;
use crate::utils::session::AuthSession;
use crate::FpResult;
use crypto::aead::ScopedSealingKey;
use db::PgConn;
use db::TxnPgConn;
use newtypes::Locked;

/// Marker trait for Ts wrapped by SessionContext<T>. When this trait is implemented for T,
/// you'll be able to call SessionContext<T>.update_session(...) to transparently replace the
/// session data for this auth token
pub trait AllowSessionUpdate: GetSessionForUpdate {}

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
    ) -> FpResult<()>;

    fn lock(self, conn: &mut TxnPgConn, sealing_key: &ScopedSealingKey) -> FpResult<Locked<AuthSession>>;
}

impl<T> UpdateSession for T
where
    T: AllowSessionUpdate,
{
    fn update_session(
        self, // Intentionally consume to prevent reading stale value
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> FpResult<()> {
        self.session().update(conn, session_sealing_key, data)?;
        Ok(())
    }

    fn lock(self, conn: &mut TxnPgConn, sealing_key: &ScopedSealingKey) -> FpResult<Locked<AuthSession>> {
        let session = self.session();
        let session = AuthSession::lock(conn, sealing_key, &session.key)?;
        Ok(session)
    }
}
