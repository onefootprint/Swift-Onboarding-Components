use crate::diesel::ExpressionMethods;
use crate::{
    schema::{self, webauthn_credentials},
    DbPool,
};
use chrono::NaiveDateTime;
use diesel::{Insertable, OptionalExtension, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::UserVaultId;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
}

impl WebauthnCredential {
    pub fn get_opt_for_user_vault(
        conn: &PgConnection,
        user_vault_id: UserVaultId,
    ) -> Result<Option<Vec<Self>>, crate::DbError> {
        let creds = schema::webauthn_credentials::table
            .filter(schema::webauthn_credentials::user_vault_id.eq(user_vault_id))
            .get_results(conn)
            .optional()?;

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
