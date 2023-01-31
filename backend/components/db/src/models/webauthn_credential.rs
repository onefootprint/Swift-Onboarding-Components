use crate::diesel::ExpressionMethods;
use crate::schema::{self, webauthn_credential};
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{AttestationType, InsightEventId, UserVaultId, WebauthnCredentialId};
use serde::{Deserialize, Serialize};

use super::insight_event::InsightEvent;

// TODO handle when a user tries to add a second webauthn credential
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = webauthn_credential)]
pub struct WebauthnCredential {
    pub id: WebauthnCredentialId,
    pub user_vault_id: UserVaultId,
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
    pub fn get_for_user_vault(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> DbResult<Vec<Self>> {
        let creds = schema::webauthn_credential::table
            .filter(schema::webauthn_credential::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;

        Ok(creds)
    }

    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> DbResult<Vec<(Self, InsightEvent)>> {
        let creds = schema::webauthn_credential::table
            .filter(schema::webauthn_credential::user_vault_id.eq(user_vault_id))
            .inner_join(schema::insight_event::table)
            .get_results(conn)?;

        Ok(creds)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&WebauthnCredentialId>,
    ) -> DbResult<Vec<(Self, InsightEvent)>> {
        let results = webauthn_credential::table
            .inner_join(schema::insight_event::table)
            .filter(webauthn_credential::id.eq_any(ids))
            .get_results::<(WebauthnCredential, InsightEvent)>(conn)?;

        Ok(results)
    }

    pub fn update_backup_state(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
        cred_id: &[u8],
    ) -> DbResult<()> {
        diesel::update(webauthn_credential::table)
            .filter(webauthn_credential::user_vault_id.eq(user_vault_id))
            .filter(webauthn_credential::credential_id.eq(cred_id))
            .set(&UpdateCredentialBackupState { backup_state: true })
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = webauthn_credential)]
pub struct NewWebauthnCredential {
    pub user_vault_id: UserVaultId,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub attestation_data: Vec<u8>,
    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: InsightEventId,
    pub backup_state: bool,
}

impl NewWebauthnCredential {
    pub fn save(self, conn: &mut PgConnection) -> DbResult<WebauthnCredential> {
        let result = diesel::insert_into(webauthn_credential::table)
            .values(self)
            .get_result(conn)?;
        Ok(result)
    }
}
