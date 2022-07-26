use chrono::{DateTime, Duration, Utc};
use crypto::aead::ScopedSealingKey;
use db::{models::sessions::Session, PgConnection};
use newtypes::{SealedSessionBytes, SessionAuthToken};

use crate::{
    auth::session_data::{ServerSession, SessionData},
    errors::ApiError,
    State,
};

pub struct AuthSession {
    pub key: String,
    pub expires_at: DateTime<Utc>,
    pub data: ServerSession,
}

impl AuthSession {
    pub async fn get(state: &State, auth_token: &SessionAuthToken) -> Result<Option<Self>, crate::ApiError> {
        let key = auth_token.id();
        let session: Option<Session> = state
            .db_pool
            .db_query(move |conn| Session::get(conn, key))
            .await??;
        let session = if let Some(session) = session {
            Some(Self {
                key: session.key,
                expires_at: session.expires_at,
                data: ServerSession::unseal(&state.session_sealing_key, &SealedSessionBytes(session.data))?,
            })
        } else {
            None
        };
        Ok(session)
    }

    pub async fn create(
        state: &State,
        data: SessionData,
        expires_in: Duration,
    ) -> Result<SessionAuthToken, db::DbError> {
        let key = state.session_sealing_key.clone();
        let auth_token = state
            .db_pool
            .db_query(move |conn| Self::create_sync(conn, &key, data, expires_in))
            .await??;

        Ok(auth_token)
    }

    pub fn create_sync(
        conn: &mut PgConnection,
        session_sealing_key: &ScopedSealingKey,
        data: SessionData,
        expires_in: Duration,
    ) -> Result<SessionAuthToken, db::DbError> {
        let token = SessionAuthToken::generate();
        let expires_at = Utc::now() + expires_in;
        let server_session = ServerSession::new(data, expires_at);
        let sealed_session_data = server_session.seal(session_sealing_key)?;
        Session::update_or_create(conn, token.id(), sealed_session_data.0, expires_at)?;
        Ok(token)
    }

    pub async fn update(
        state: &State,
        auth_token: &SessionAuthToken,
        new_data: SessionData,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        let session = ServerSession::new(new_data, expires_at);
        let sealed = session.seal(&state.session_sealing_key)?;
        let key = auth_token.id();
        state
            .db_pool
            .db_query(move |conn| Session::update_or_create(conn, key, sealed.0, expires_at))
            .await??;
        Ok(())
    }
}
