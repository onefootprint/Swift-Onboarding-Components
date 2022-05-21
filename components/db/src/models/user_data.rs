use crate::diesel::RunQueryDsl;
use crate::schema::user_data;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{DataKind, UserDataId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "user_data"]
pub struct UserData {
    pub id: UserDataId,
    pub user_vault_id: UserVaultId,
    pub data_kind: DataKind,
    pub e_data: Vec<u8>,
    pub sh_data: Option<Vec<u8>>,
    pub is_verified: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
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
    pub e_data: Vec<u8>,
    pub sh_data: Option<Vec<u8>>,
}

impl NewUserData {
    pub async fn save(self, pool: &DbPool) -> Result<UserData, crate::DbError> {
        let user_data = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(user_data::table)
                    .values(self)
                    .get_result::<UserData>(conn)
            })
            .await??;
        Ok(user_data)
    }
}

pub struct NewUserDataBatch(pub Vec<NewUserData>);

impl NewUserDataBatch {
    pub async fn bulk_insert(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(user_data::table)
                    .values(self.0)
                    .execute(conn)
            })
            .await??;
        Ok(())
    }
}
