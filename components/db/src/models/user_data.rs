use crate::diesel::RunQueryDsl;
use crate::schema::user_data;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{DataKind, DataPriority, Fingerprint, SealedVaultBytes, UserDataId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "user_data"]
pub struct UserData {
    pub id: UserDataId,
    pub user_vault_id: UserVaultId,
    pub data_kind: DataKind,
    pub e_data: SealedVaultBytes,
    pub sh_data: Option<Fingerprint>,
    pub is_verified: bool,
    pub data_priority: DataPriority,
    pub deactivated_at: Option<NaiveDateTime>,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

impl UserData {
    pub async fn mark_verified(self, pool: &DbPool) -> Result<UserData, crate::DbError> {
        let result = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::update(user_data::table.filter(user_data::id.eq(self.id)))
                    .set(user_data::is_verified.eq(true))
                    .get_result::<UserData>(conn)
            })
            .await??;
        Ok(result)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_data"]
pub struct NewUserData {
    pub user_vault_id: UserVaultId,
    pub data_kind: DataKind,
    pub data_priority: DataPriority,
    pub e_data: SealedVaultBytes,
    pub sh_data: Option<Fingerprint>,
    pub is_verified: bool,
}

pub struct NewUserDataBatch(pub Vec<NewUserData>);

impl NewUserDataBatch {
    pub fn bulk_insert(self, conn: &PgConnection) -> Result<(), crate::DbError> {
        let _: usize = diesel::insert_into(user_data::table)
            .values(self.0)
            .execute(conn)?;
        Ok(())
    }
}
