use crate::diesel::ExpressionMethods;
use crate::{
    schema::{self, webauthn_credentials},
    DbPool,
};
use chrono::NaiveDateTime;
use diesel::dsl::any;
use diesel::{Insertable, JoinOnDsl, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{AttestationType, FootprintUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::insight_event::InsightEvent;

// TODO handle when a user tries to add a second webauthn credential
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[table_name = "webauthn_credentials"]
pub struct WebauthnCredential {
    pub id: Uuid,
    pub user_vault_id: UserVaultId,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub counter: i32,
    pub attestation_data: Vec<u8>,

    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,

    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: Uuid,
}

impl WebauthnCredential {
    pub fn get_for_user_vault(
        conn: &PgConnection,
        user_vault_id: UserVaultId,
    ) -> Result<Vec<Self>, crate::DbError> {
        let creds = schema::webauthn_credentials::table
            .filter(schema::webauthn_credentials::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;

        Ok(creds)
    }

    pub fn get_for_onboarding(
        conn: &PgConnection,
        tenant_id: &TenantId,
        footprint_user_id: &FootprintUserId,
    ) -> Result<Vec<(Self, InsightEvent)>, crate::DbError> {
        let user_vault_ids = schema::onboardings::table
            .filter(schema::onboardings::tenant_id.eq(tenant_id))
            .filter(schema::onboardings::user_ob_id.eq(footprint_user_id))
            .select(schema::onboardings::user_vault_id);
        let creds = schema::webauthn_credentials::table
            .inner_join(
                schema::insight_events::table
                    .on(schema::insight_events::id.eq(schema::webauthn_credentials::insight_event_id)),
            )
            .filter(schema::webauthn_credentials::user_vault_id.eq(any(user_vault_ids)))
            .get_results(conn)?;

        Ok(creds)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "webauthn_credentials"]
pub struct NewWebauthnCredential {
    pub user_vault_id: UserVaultId,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub attestation_data: Vec<u8>,
    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: Uuid,
}

impl NewWebauthnCredential {
    pub async fn save(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(webauthn_credentials::table)
                    .values(self)
                    .execute(conn)
            })
            .await??;
        Ok(())
    }
}
