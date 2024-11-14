use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::fingerprint_visit_event;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::FingerprintRequestId;
use newtypes::FingerprintVisitEventId;
use newtypes::FingerprintVisitorId;
use newtypes::ScopedVaultId;
use newtypes::SessionId;
use newtypes::VaultId;

/// Represents a single visit from a FootprintVisitorId
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = fingerprint_visit_event)]
pub struct FingerprintVisitEvent {
    pub id: FingerprintVisitEventId,
    pub visitor_id: FingerprintVisitorId,
    pub vault_id: Option<VaultId>,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub path: String,
    pub session_id: Option<SessionId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub fingerprint_request_id: FingerprintRequestId,
    pub response: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint_visit_event)]
pub struct NewFingerprintVisit {
    pub visitor_id: FingerprintVisitorId,
    pub vault_id: Option<VaultId>,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub path: String,
    pub session_id: Option<SessionId>,
    pub created_at: DateTime<Utc>,
    pub request_id: FingerprintRequestId,
    pub response: Option<serde_json::Value>,
}

impl FingerprintVisitEvent {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("FingerprintVisitEvent::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        visitor_id: FingerprintVisitorId,
        request_id: FingerprintRequestId,
        vault_id: Option<VaultId>,
        scoped_vault_id: Option<ScopedVaultId>,
        path: String,
        session_id: Option<SessionId>,
        response: Option<serde_json::Value>,
    ) -> FpResult<Self> {
        let new_row = NewFingerprintVisit {
            visitor_id,
            vault_id,
            scoped_vault_id,
            path,
            session_id,
            created_at: Utc::now(),
            request_id,
            response,
        };

        let visit = diesel::insert_into(fingerprint_visit_event::table)
            .values(new_row)
            .get_result(conn)?;

        Ok(visit)
    }
}
