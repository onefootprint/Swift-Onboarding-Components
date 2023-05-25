use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{
    IdentityDocumentId, IncodeFailureReason, IncodeVerificationSessionEventId, IncodeVerificationSessionId,
    IncodeVerificationSessionKind, IncodeVerificationSessionState,
};
use serde::{Deserialize, Serialize};

use crate::{schema::incode_verification_session_event, DbResult, PgConn, TxnPgConn};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = incode_verification_session_event)]
pub struct IncodeVerificationSessionEvent {
    pub id: IncodeVerificationSessionEventId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub incode_verification_session_id: IncodeVerificationSessionId,
    pub incode_verification_session_state: IncodeVerificationSessionState,
    pub identity_document_id: IdentityDocumentId,
    pub latest_failure_reason: Option<IncodeFailureReason>,
    pub kind: IncodeVerificationSessionKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = incode_verification_session_event)]
pub struct NewIncodeVerificationSessionEvent {
    pub created_at: DateTime<Utc>,
    pub incode_verification_session_id: IncodeVerificationSessionId,
    pub incode_verification_session_state: IncodeVerificationSessionState,
    pub identity_document_id: IdentityDocumentId,
    pub latest_failure_reason: Option<IncodeFailureReason>,
    pub kind: IncodeVerificationSessionKind,
}

impl IncodeVerificationSessionEvent {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        incode_verification_session_id: IncodeVerificationSessionId,
        incode_verification_session_state: IncodeVerificationSessionState,
        identity_document_id: IdentityDocumentId,
        latest_failure_reason: Option<IncodeFailureReason>,
        kind: IncodeVerificationSessionKind,
    ) -> DbResult<Self> {
        let new_req = NewIncodeVerificationSessionEvent {
            created_at: Utc::now(),
            incode_verification_session_id,
            incode_verification_session_state,
            identity_document_id,
            latest_failure_reason,
            kind,
        };

        let res = diesel::insert_into(incode_verification_session_event::table)
            .values(new_req)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_for_session_id(
        conn: &mut PgConn,
        session_id: &IncodeVerificationSessionId,
    ) -> DbResult<Vec<Self>> {
        let res = incode_verification_session_event::table
            .filter(incode_verification_session_event::incode_verification_session_id.eq(session_id))
            .get_results(conn)?;

        Ok(res)
    }
}
