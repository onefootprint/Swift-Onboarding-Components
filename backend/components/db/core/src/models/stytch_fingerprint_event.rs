use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::stytch_fingerprint_event;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::StytchBrowserFingerprint;
use newtypes::StytchFingerprintEventId;
use newtypes::StytchVisitorId;
use newtypes::VerificationResultId;
use newtypes::{
    ScopedVaultId, StytchBrowserId, StytchHardwareFingerprint, StytchNetworkFingerprint,
    StytchVisitorFingerprint, VaultId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = stytch_fingerprint_event)]
pub struct StytchFingerprintEvent {
    pub id: StytchFingerprintEventId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub session_id: Option<String>,
    pub vault_id: Option<VaultId>,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub verification_result_id: VerificationResultId,
    pub browser_fingerprint: Option<StytchBrowserFingerprint>,
    pub browser_id: Option<StytchBrowserId>,
    pub hardware_fingerprint: Option<StytchHardwareFingerprint>,
    pub network_fingerprint: Option<StytchNetworkFingerprint>,
    pub visitor_fingerprint: Option<StytchVisitorFingerprint>,
    pub visitor_id: Option<StytchVisitorId>,
}
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = stytch_fingerprint_event)]
pub struct NewStytchFingerprintEvent {
    pub created_at: DateTime<Utc>,
    pub session_id: Option<String>,
    pub vault_id: Option<VaultId>,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub verification_result_id: VerificationResultId,
    pub browser_fingerprint: Option<StytchBrowserFingerprint>,
    pub browser_id: Option<StytchBrowserId>,
    pub hardware_fingerprint: Option<StytchHardwareFingerprint>,
    pub network_fingerprint: Option<StytchNetworkFingerprint>,
    pub visitor_fingerprint: Option<StytchVisitorFingerprint>,
    pub visitor_id: Option<StytchVisitorId>,
}
impl StytchFingerprintEvent {
    #[tracing::instrument("StytchFingerprintEvent::create", skip_all)]
    pub fn create(conn: &mut PgConn, new_event: NewStytchFingerprintEvent) -> DbResult<Self> {
        let res = diesel::insert_into(stytch_fingerprint_event::table)
            .values(new_event)
            .get_result(conn)?;

        Ok(res)
    }
}
