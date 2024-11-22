use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::session;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::AuthTokenHash;
use newtypes::Locked;
use newtypes::SessionKind;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = session)]
pub struct Session {
    pub key: AuthTokenHash,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub data: Vec<u8>,
    pub kind: Option<SessionKind>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = session)]
pub struct UpdateSession {
    pub key: AuthTokenHash,
    pub data: Vec<u8>,
    pub expires_at: DateTime<Utc>,
    pub kind: Option<SessionKind>,
}

impl Session {
    #[tracing::instrument("Session::get", skip_all)]
    /// Return the session with the provided hash.
    /// NOTE: the returned session may be expired
    pub fn get(conn: &mut PgConn, key: AuthTokenHash) -> FpResult<Option<Session>> {
        let session = session::table
            .filter(session::key.eq(key))
            .first::<Session>(conn)
            .optional()?;
        Ok(session)
    }

    #[tracing::instrument("Session::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, key: &AuthTokenHash) -> FpResult<Locked<Session>> {
        let session = session::table
            .filter(session::key.eq(key))
            .for_update()
            .first::<Session>(conn.conn())?;
        Ok(Locked::new(session))
    }

    #[tracing::instrument("Session::update_or_create", skip_all)]
    pub fn update_or_create(
        conn: &mut PgConn,
        key: AuthTokenHash,
        data: Vec<u8>,
        kind: SessionKind,
        expires_at: DateTime<Utc>,
    ) -> FpResult<Session> {
        let session = UpdateSession {
            key,
            data,
            expires_at,
            kind: Some(kind),
        };
        let session = diesel::insert_into(session::table)
            .values(&session)
            .on_conflict(session::key)
            .do_update()
            .set((
                session::data.eq(&session.data),
                session::kind.eq(&session.kind),
                session::expires_at.eq(&session.expires_at),
            ))
            .get_result::<Session>(conn)?;
        Ok(session)
    }

    #[tracing::instrument("Session::invalidate", skip_all)]
    pub fn invalidate(key: AuthTokenHash, conn: &mut PgConn) -> FpResult<()> {
        let now = Utc::now();
        diesel::update(session::table)
            .filter(session::key.eq(key))
            .set((session::expires_at.eq(&now),))
            .execute(conn)?;
        Ok(())
    }
}
