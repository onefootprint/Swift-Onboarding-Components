use crate::{
    DbResult,
    PgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::session;
use diesel::prelude::*;
use diesel::{
    Insertable,
    Queryable,
};
use newtypes::{
    AuthTokenHash,
    SessionKind,
};

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
    pub fn get(conn: &mut PgConn, key: AuthTokenHash) -> DbResult<Option<Session>> {
        let session = session::table
            .filter(session::key.eq(key))
            .first::<Session>(conn)
            .optional()?;
        Ok(session)
    }

    #[tracing::instrument("Session::update_or_create", skip_all)]
    pub fn update_or_create(
        conn: &mut PgConn,
        key: AuthTokenHash,
        data: Vec<u8>,
        kind: SessionKind,
        expires_at: DateTime<Utc>,
    ) -> Result<Session, crate::DbError> {
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
    pub fn invalidate(key: AuthTokenHash, conn: &mut PgConn) -> DbResult<()> {
        let now = Utc::now();
        diesel::update(session::table)
            .filter(session::key.eq(key))
            .set((session::expires_at.eq(&now),))
            .execute(conn)?;
        Ok(())
    }
}
