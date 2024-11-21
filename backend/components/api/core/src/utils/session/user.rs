use crate::auth::session::AuthSessionData;
use crate::errors::error_with_code::ErrorWithCode;
use crate::State;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use crypto::aead::ScopedSealingKey;
use db::models::session::Session;
use db::PgConn;
use newtypes::AuthTokenHash;
use newtypes::HasSessionKind;
use newtypes::SealedSessionBytes;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone)]
pub struct AuthSession {
    pub key: AuthTokenHash,
    pub expires_at: DateTime<Utc>,
    pub data: AuthSessionData,
}

#[derive(derive_more::From)]
pub enum Expiry {
    ExpiresIn(Duration),
    ExpiresAt(DateTime<Utc>),
}

impl AuthSession {
    pub fn get(
        conn: &mut PgConn,
        sealing_key: &ScopedSealingKey,
        auth_token: &SessionAuthToken,
    ) -> FpResult<Self> {
        let key = auth_token.id();
        let session = Session::get(conn, key)?;
        let Some(session) = session else {
            return Err(ErrorWithCode::NoSessionFound.into());
        };
        let data = AuthSessionData::unseal(sealing_key, SealedSessionBytes(session.data));
        let data = if let Err(crypto::Error::Cbor(e)) = data {
            tracing::info!(e=?e, "Couldn't parse auth session");
            if session.expires_at <= Utc::now() {
                // We want to special case still show the "expired" message if we're trying to
                // deserialize an old session. No reason to error that the session is invalid when
                // the session is actually expired
                return Err(ErrorWithCode::SessionExpired.into());
            } else {
                return Err(ErrorWithCode::CouldNotParseSession.into());
            }
        } else {
            data?
        };
        // Log the Debug implementation of the auth session data.
        // If auth extractors don't run, this will give us some information we can use to debug
        tracing::info!(kind=%data.session_kind(), info=?data, "Loaded auth session from DB");

        // Check session expiration before returning it but after logging info
        if session.expires_at <= Utc::now() {
            return Err(ErrorWithCode::SessionExpired.into());
        }

        let session = Self {
            key: session.key,
            expires_at: session.expires_at,
            data,
        };
        Ok(session)
    }

    pub async fn create<T: Into<AuthSessionData>>(
        state: &State,
        data: T,
        expires_in: Duration,
    ) -> FpResult<SessionAuthToken> {
        let data = data.into();
        let key = state.session_sealing_key.clone();
        let (auth_token, _) = state
            .db_query(move |conn| Self::create_sync(conn, &key, data, expires_in))
            .await?;

        Ok(auth_token)
    }

    #[tracing::instrument(skip_all)]
    pub fn create_sync<T: Into<AuthSessionData>>(
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: T,
        expiry: impl Into<Expiry>,
    ) -> FpResult<(SessionAuthToken, Self)> {
        let data = data.into();
        let tok_prefix = data.token_prefix();
        let token = SessionAuthToken::generate(tok_prefix);
        let new_auth_token_hash = token.id();
        tracing::info!(%new_auth_token_hash, "Token created");
        let expires_at = match expiry.into() {
            Expiry::ExpiresIn(expires_in) => Utc::now() + expires_in,
            Expiry::ExpiresAt(expires_at) => expires_at,
        };
        let kind = data.session_kind();
        let sealed_data = data.seal(session_sealing_key)?;
        Session::update_or_create(conn, token.id(), sealed_data.0, kind, expires_at)?;
        let session = Self {
            key: token.id(),
            expires_at,
            data,
        };
        Ok((token, session))
    }

    pub fn update(
        self, // Intentionally consume to prevent reading stale values
        conn: &mut PgConn,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> FpResult<()> {
        let kind = data.session_kind();
        let sealed_data = data.seal(session_sealing_key)?;
        // Keep the same expiration date and primary key in the DB - just update the data
        // can use AuthSessionData kind
        Session::update_or_create(conn, self.key.clone(), sealed_data.0, kind, self.expires_at)?;
        Ok(())
    }

    /// Creates a new auth token with an expiry derived off of the current auth token.
    /// This function guarantees that we won't create a derived token that expires after the source
    /// token.
    pub fn create_derived(
        &self,
        conn: &mut db::PgConn,
        session_key: &ScopedSealingKey,
        session: AuthSessionData,
        max_duration: Option<Duration>,
    ) -> FpResult<(SessionAuthToken, DateTime<Utc>)> {
        let current_expires_at = self.expires_at;
        let expires_at = if let Some(duration) = max_duration {
            current_expires_at.min(Utc::now() + duration)
        } else {
            current_expires_at
        };
        let (token, session) = Self::create_sync(conn, session_key, session, expires_at)?;
        Ok((token, session.expires_at))
    }
}
