use crate::diesel::ExpressionMethods;
use crate::schema::{self, webauthn_credential};
use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{
    AttestationType, FootprintUserId, InsightEventId, TenantId, UserVaultId, WebauthnCredentialId,
};
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
}

impl WebauthnCredential {
    pub fn get_for_user_vault(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<Self>, crate::DbError> {
        let creds = schema::webauthn_credential::table
            .filter(schema::webauthn_credential::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;

        Ok(creds)
    }

    pub fn list(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<(Self, InsightEvent)>, crate::DbError> {
        let creds = schema::webauthn_credential::table
            .filter(schema::webauthn_credential::user_vault_id.eq(user_vault_id))
            .inner_join(schema::insight_event::table)
            .get_results(conn)?;

        Ok(creds)
    }

    pub fn get_for_scoped_user(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        footprint_user_id: &FootprintUserId,
        is_live: bool,
    ) -> Result<Vec<(Self, InsightEvent)>, crate::DbError> {
        let user_vault_ids = schema::scoped_user::table
            .filter(schema::scoped_user::tenant_id.eq(tenant_id))
            .filter(schema::scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(schema::scoped_user::is_live.eq(is_live))
            .select(schema::scoped_user::user_vault_id);
        let creds = schema::webauthn_credential::table
            .inner_join(schema::insight_event::table)
            .filter(schema::webauthn_credential::user_vault_id.eq_any(user_vault_ids))
            .get_results(conn)?;

        Ok(creds)
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
}

impl NewWebauthnCredential {
    pub fn save(self, conn: &mut PgConnection) -> Result<(), crate::DbError> {
        diesel::insert_into(webauthn_credential::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}
