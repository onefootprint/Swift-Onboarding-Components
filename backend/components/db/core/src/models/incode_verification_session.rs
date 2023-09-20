use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Duration, Utc};
use db_schema::schema::incode_verification_session::{self, BoxedQuery};
use diesel::{pg::Pg, prelude::*};
use newtypes::{
    IdentityDocumentId, IncodeAuthorizationToken, IncodeConfigurationId, IncodeFailureReason,
    IncodeSessionId, IncodeVerificationSessionId, IncodeVerificationSessionKind,
    IncodeVerificationSessionState,
};
use serde::{Deserialize, Serialize};

use super::incode_verification_session_event::IncodeVerificationSessionEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = incode_verification_session)]
pub struct IncodeVerificationSession {
    pub id: IncodeVerificationSessionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,

    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_configuration_id: IncodeConfigurationId,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,

    /// There is one IncodeVerificationSession for each IdentityDocument
    pub identity_document_id: IdentityDocumentId,
    pub state: IncodeVerificationSessionState,
    pub completed_at: Option<DateTime<Utc>>,
    pub kind: IncodeVerificationSessionKind,
    /// Not used by application code anywhere, just used for debugging
    pub latest_failure_reasons: Vec<IncodeFailureReason>,
    pub ignored_failure_reasons: Vec<IncodeFailureReason>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = incode_verification_session)]
struct NewIncodeVerificationSession {
    created_at: DateTime<Utc>,
    state: IncodeVerificationSessionState,
    incode_configuration_id: IncodeConfigurationId,
    identity_document_id: IdentityDocumentId,
    kind: IncodeVerificationSessionKind,
    latest_failure_reasons: Vec<IncodeFailureReason>,
    ignored_failure_reasons: Vec<IncodeFailureReason>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = incode_verification_session)]
pub struct UpdateIncodeVerificationSession {
    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,
    pub identity_document_id: Option<IdentityDocumentId>,
    pub completed_at: Option<DateTime<Utc>>,
    pub state: Option<IncodeVerificationSessionState>,
    pub latest_failure_reasons: Option<Vec<IncodeFailureReason>>,
    pub ignored_failure_reasons: Option<Vec<IncodeFailureReason>>,
}

impl UpdateIncodeVerificationSession {
    pub fn set_state(
        state: IncodeVerificationSessionState,
        failure_reasons: Vec<IncodeFailureReason>,
        ignored_failure_reasons: Option<Vec<IncodeFailureReason>>,
    ) -> Self {
        Self {
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            // NOTE: this is tricky to read - this could be `Some(None)`, which would wipe the
            // failure reason. Need to wrap in outer option since by default, a diesel changeset
            // ignores any updates with value None
            latest_failure_reasons: Some(failure_reasons),
            ignored_failure_reasons,
            ..Self::default()
        }
    }

    pub fn set_state_and_incode_session_and_token(
        state: IncodeVerificationSessionState,
        session_id: IncodeSessionId,
        token: IncodeAuthorizationToken,
    ) -> Self {
        Self {
            incode_session_id: Some(session_id),
            incode_authentication_token: Some(token),
            // 90d is what incode communicated to us
            incode_authentication_token_expires_at: Some(Utc::now() + Duration::days(90)),
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            ..Self::default()
        }
    }
}

impl IncodeVerificationSession {
    #[tracing::instrument("IncodeVerificationSession::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        identity_document_id: IdentityDocumentId,
        configuration_id: IncodeConfigurationId,
        kind: IncodeVerificationSessionKind,
    ) -> DbResult<Self> {
        let new_req = NewIncodeVerificationSession {
            created_at: Utc::now(),
            state: IncodeVerificationSessionState::StartOnboarding,
            incode_configuration_id: configuration_id,
            identity_document_id,
            kind: kind.clone(),
            latest_failure_reasons: vec![],
            ignored_failure_reasons: vec![],
        };

        let res: IncodeVerificationSession = diesel::insert_into(incode_verification_session::table)
            .values(new_req)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            vec![],
            kind,
        )?;

        Ok(res)
    }

    #[tracing::instrument("IncodeVerificationSession::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: &IncodeVerificationSessionId,
        update: UpdateIncodeVerificationSession,
    ) -> DbResult<Self> {
        let res: IncodeVerificationSession = diesel::update(incode_verification_session::table)
            .filter(incode_verification_session::id.eq(id))
            .set(update)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            res.latest_failure_reasons.clone(),
            res.kind.clone(),
        )?;

        Ok(res)
    }

    fn query(id: IncodeSessionIdentifier) -> BoxedQuery<Pg> {
        match id {
            IncodeSessionIdentifier::Id(id) => incode_verification_session::table
                .filter(incode_verification_session::id.eq(id))
                .into_boxed(),
            IncodeSessionIdentifier::IdDoc(id) => incode_verification_session::table
                .filter(incode_verification_session::identity_document_id.eq(id))
                .into_boxed(),
        }
    }

    #[tracing::instrument("IncodeVerificationSession::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Option<Self>>
    where
        T: Into<IncodeSessionIdentifier<'a>>,
    {
        let vs = Self::query(id.into()).first(conn).optional()?;
        Ok(vs)
    }
}

pub enum IncodeSessionIdentifier<'a> {
    Id(&'a IncodeVerificationSessionId),
    IdDoc(&'a IdentityDocumentId),
}

impl<'a> From<&'a IncodeVerificationSessionId> for IncodeSessionIdentifier<'a> {
    fn from(id: &'a IncodeVerificationSessionId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a IdentityDocumentId> for IncodeSessionIdentifier<'a> {
    fn from(id: &'a IdentityDocumentId) -> Self {
        Self::IdDoc(id)
    }
}
