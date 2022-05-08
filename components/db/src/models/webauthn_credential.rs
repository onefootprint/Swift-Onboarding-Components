use crate::{schema::webauthn_credentials, DbPool};
use chrono::NaiveDateTime;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[table_name = "webauthn_credentials"]
pub struct WebauthnCredential {
    pub id: Uuid,
    pub user_vault_id: String,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub counter: i32,
    pub attestation_data: Vec<u8>,

    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "webauthn_credentials"]
pub struct NewWebauthnCredential {
    pub user_vault_id: String,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub attestation_data: Vec<u8>,
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
