use crate::diesel::ExpressionMethods;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::{self, webauthn_credential};
use diesel::{Insertable, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{AttestationType, InsightEventId, VaultId, WebauthnCredentialId};

use super::insight_event::InsightEvent;

// TODO handle when a user tries to add a second webauthn credential
#[derive(Debug, Clone, Queryable, Identifiable)]
#[diesel(table_name = webauthn_credential)]
pub struct WebauthnCredential {
    pub id: WebauthnCredentialId,
    pub vault_id: VaultId,
    /// a webauthn "key handle" aka as "credential id": https://www.w3.org/TR/webauthn-2/#credential-id
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub counter: i32,
    pub attestation_data: Vec<u8>,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: InsightEventId,
    pub backup_state: bool,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = webauthn_credential)]
struct UpdateCredentialBackupState {
    backup_state: bool,
}

impl WebauthnCredential {
    #[tracing::instrument("WebauthnCredential::list", skip_all)]
    pub fn list(conn: &mut PgConn, vault_id: &VaultId) -> DbResult<Vec<Self>> {
        let creds = schema::webauthn_credential::table
            .filter(schema::webauthn_credential::vault_id.eq(vault_id))
            .get_results(conn)?;

        Ok(creds)
    }

    #[tracing::instrument("WebauthnCredential::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&WebauthnCredentialId>,
    ) -> DbResult<Vec<(Self, InsightEvent)>> {
        let results = webauthn_credential::table
            .inner_join(schema::insight_event::table)
            .filter(webauthn_credential::id.eq_any(ids))
            .get_results::<(WebauthnCredential, InsightEvent)>(conn)?;

        Ok(results)
    }

    #[tracing::instrument("WebauthnCredential::update_backup_state", skip_all)]
    pub fn update_backup_state(&self, conn: &mut PgConn) -> DbResult<()> {
        diesel::update(webauthn_credential::table)
            .filter(webauthn_credential::id.eq(self.id.clone()))
            .set(&UpdateCredentialBackupState { backup_state: true })
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("WebauthnCredential::get_by_credential_id", skip_all)]
    pub fn get_by_credential_id(conn: &mut PgConn, vault_id: &VaultId, cred_id: &[u8]) -> DbResult<Self> {
        Ok(webauthn_credential::table
            .filter(webauthn_credential::vault_id.eq(vault_id))
            .filter(webauthn_credential::credential_id.eq(cred_id))
            .get_result(conn)?)
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = webauthn_credential)]
pub struct NewWebauthnCredential {
    pub vault_id: VaultId,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub attestation_data: Vec<u8>,
    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: InsightEventId,
    pub backup_state: bool,
}

impl NewWebauthnCredential {
    #[tracing::instrument("NewWebauthnCredential::save", skip_all)]
    pub fn save(self, conn: &mut PgConn) -> DbResult<WebauthnCredential> {
        let result = diesel::insert_into(webauthn_credential::table)
            .values(self)
            .get_result(conn)?;
        Ok(result)
    }
}
