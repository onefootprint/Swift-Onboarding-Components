use crate::PgConn;
use crate::{schema::fingerprint_visit_event, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FingerprintRequestId, FingerprintVisitEventId, FingerprintVisitorId, ScopedVaultId, VaultId};
use serde::{Deserialize, Serialize};

/// Represents a single visit from a FootprintVisitorId
#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = fingerprint_visit_event)]
pub struct FingerprintVisitEvent {
    pub id: FingerprintVisitEventId,
    pub visitor_id: FingerprintVisitorId,
    pub user_vault_id: Option<VaultId>,
    pub scoped_user_id: Option<ScopedVaultId>,
    pub path: String,
    pub session_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub fingerprint_request_id: FingerprintRequestId,
}
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = fingerprint_visit_event)]
pub struct NewFingerprintVisit {
    pub visitor_id: FingerprintVisitorId,
    pub user_vault_id: Option<VaultId>,
    pub scoped_user_id: Option<ScopedVaultId>,
    pub path: String,
    pub session_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub request_id: FingerprintRequestId,
}
impl FingerprintVisitEvent {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        visitor_id: FingerprintVisitorId,
        request_id: FingerprintRequestId,
        user_vault_id: Option<VaultId>,
        scoped_user_id: Option<ScopedVaultId>,
        path: String,
        session_id: Option<String>,
    ) -> DbResult<Self> {
        let new_row = NewFingerprintVisit {
            visitor_id,
            user_vault_id,
            scoped_user_id,
            path,
            session_id,
            created_at: Utc::now(),
            request_id,
        };

        let visit = diesel::insert_into(fingerprint_visit_event::table)
            .values(new_row)
            .get_result(conn)?;

        Ok(visit)
    }
}
