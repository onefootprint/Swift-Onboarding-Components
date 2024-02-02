use chrono::{DateTime, Duration, Utc};
use crypto::aead::ScopedSealingKey;
use db::{models::session::Session, DbResult, PgConn};
use newtypes::{AuthTokenHash, HasSessionKind, SealedSessionBytes, SessionAuthToken};

use crate::{
    auth::{session::AuthSessionData, AuthError},
    errors::ApiResult,
    State,
};

#[derive(Debug, Clone)]
pub struct AuthSession {
    pub key: AuthTokenHash,
    pub expires_at: DateTime<Utc>,
    pub data: AuthSessionData,
}

impl AuthSession {
    pub async fn get(state: &State, auth_token: &SessionAuthToken) -> ApiResult<Self> {
        let key = auth_token.id();
        let session: Option<Session> = state
            .db_pool
            .db_query(move |conn| Session::get(conn, key))
            .await?;
        let Some(session) = session else {
            return Err(AuthError::NoSessionFound.into());
        };
        let data = AuthSessionData::unseal(&state.session_sealing_key, SealedSessionBytes(session.data));
        let data = if let Err(crypto::Error::Cbor(_)) = data {
            return Err(AuthError::CouldNotParseSession.into());
        } else {
            data?
        };
        // Log the Debug implementation of the auth session data.
        // If auth extractors don't run, this will give us some information we can use to debug
        tracing::info!(kind=%data.session_kind(), info=?data, "Loaded auth session from DB");

        // Check session expiration before returning it but after logging info
        if session.expires_at <= Utc::now() {
            return Err(AuthError::SessionExpired.into());
        }

        let session = Self {
            key: session.key,
            expires_at: session.expires_at,
            data,
        };
        Ok(session)
    }

    pub async fn create(
        state: &State,
        data: AuthSessionData,
        expires_in: Duration,
    ) -> DbResult<SessionAuthToken> {
        let key = state.session_sealing_key.clone();
        let (auth_token, _) = state
            .db_pool
            .db_query(move |conn| Self::create_sync(conn, &key, data, expires_in))
            .await?;

        Ok(auth_token)
    }

    #[tracing::instrument(skip_all)]
    pub fn create_sync(
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
        expires_in: Duration,
    ) -> DbResult<(SessionAuthToken, Session)> {
        let token = SessionAuthToken::generate((&data).into());
        let auth_token_hash = token.id();
        tracing::info!(%auth_token_hash, "Token created");
        let expires_at = Utc::now() + expires_in;
        let kind = data.session_kind();
        let sealed_data = data.seal(session_sealing_key)?;
        let session = Session::update_or_create(conn, token.id(), sealed_data.0, kind, expires_at)?;
        Ok((token, session))
    }

    pub fn update(
        self, // Intentionally consume to prevent reading stale values
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> DbResult<()> {
        let kind = data.session_kind();
        let sealed_data = data.seal(session_sealing_key)?;
        // Keep the same expiration date and primary key in the DB - just update the data
        // can use AuthSessionData kind
        Session::update_or_create(conn, self.key.clone(), sealed_data.0, kind, self.expires_at)?;
        Ok(())
    }
}
