use crate::diesel::ExpressionMethods;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::webauthn_credential;
use db_schema::schema::{
    self,
};
use diesel::Insertable;
use diesel::QueryDsl;
use diesel::Queryable;
use diesel::RunQueryDsl;
use newtypes::AttestationType;
use newtypes::InsightEventId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WebauthnCredentialId;

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
    pub deactivated_at: Option<DateTime<Utc>>,
    pub scoped_vault_id: ScopedVaultId,
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
            .filter(schema::webauthn_credential::deactivated_at.is_null())
            .get_results(conn)?;

        Ok(creds)
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
        let result = webauthn_credential::table
            .filter(webauthn_credential::vault_id.eq(vault_id))
            .filter(webauthn_credential::credential_id.eq(cred_id))
            .filter(schema::webauthn_credential::deactivated_at.is_null())
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WebauthnCredential::deactivate", skip_all)]
    /// Deactivate any webauthn credentials for the provided vault
    pub fn deactivate(conn: &mut PgConn, vault_id: &VaultId) -> DbResult<()> {
        diesel::update(webauthn_credential::table)
            .filter(webauthn_credential::vault_id.eq(vault_id))
            .set(webauthn_credential::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
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
    pub scoped_vault_id: ScopedVaultId,
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
