use crate::diesel::RunQueryDsl;
use crate::schema::user_data;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    DataGroupId, DataGroupKind, DataKind, DataPriority, Fingerprint, SealedVaultBytes, UserDataId,
    UserVaultId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = user_data)]
pub struct UserData {
    pub id: UserDataId,
    pub user_vault_id: UserVaultId,
    pub data_kind: DataKind,
    pub data_group_id: DataGroupId,
    pub data_group_kind: DataGroupKind,
    pub data_group_priority: DataPriority,
    pub e_data: SealedVaultBytes,
    pub sh_data: Option<Fingerprint>,
    pub is_verified: bool,
    pub deactivated_at: Option<NaiveDateTime>,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

impl UserData {
    pub async fn mark_verified(self, pool: &DbPool) -> Result<UserData, crate::DbError> {
        let result = pool
            .db_query(move |conn| {
                diesel::update(user_data::table.filter(user_data::id.eq(self.id)))
                    .set(user_data::is_verified.eq(true))
                    .get_result::<UserData>(conn)
            })
            .await??;
        Ok(result)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_data)]
pub struct NewUserData {
    pub user_vault_id: UserVaultId,
    pub data_kind: DataKind,
    pub data_group_id: DataGroupId,
    pub data_group_kind: DataGroupKind,
    pub data_group_priority: DataPriority,
    pub e_data: SealedVaultBytes,
    pub sh_data: Option<Fingerprint>,
    pub is_verified: bool,
}

impl NewUserData {
    /// This should always be run inside of a transaction (.db_transaction)
    pub fn insert(self, conn: &mut PgConnection) -> Result<UserData, crate::DbError> {
        ensure_new_group_uuid(conn, self.data_group_id.clone())?;
        let data = diesel::insert_into(user_data::table)
            .values(&self)
            .get_result::<UserData>(conn)?;
        Ok(data)
    }
}

fn ensure_new_group_uuid(conn: &mut PgConnection, id: DataGroupId) -> Result<(), crate::DbError> {
    let group_exists = diesel::dsl::select(diesel::dsl::exists(
        user_data::table.filter(user_data::data_group_id.eq(id)),
    ))
    .get_result(conn)?;
    if group_exists {
        return Err(crate::DbError::CouldNotCreateGroupUuid);
    }
    Ok(())
}

pub struct GroupInsert(pub Vec<NewUserData>);

impl GroupInsert {
    /// This should always be run inside of a transaction (.db_transaction)
    pub fn group_insert(self, conn: &mut PgConnection) -> Result<(), crate::DbError> {
        if let Some(req) = self.0.first() {
            ensure_new_group_uuid(conn, req.data_group_id.clone())?;
            diesel::insert_into(user_data::table)
                .values(self.0)
                .execute(conn)?;
        }
        Ok(())
    }
}

pub struct UserDataUpdate {
    pub data_kind: DataKind,
    pub e_data: SealedVaultBytes,
    pub sh_data: Option<Fingerprint>,
    pub is_verified: bool,
}

pub struct GroupDataUpdateRequest {
    pub user_vault_id: UserVaultId,
    pub data_group_kind: DataGroupKind,
    pub data_group_priority: DataPriority,
    pub data: Vec<UserDataUpdate>,
}

pub struct NewUserDataBatch(pub Vec<GroupDataUpdateRequest>);

impl NewUserDataBatch {
    pub fn bulk_insert(self, conn: &mut PgConnection) -> Result<(), crate::DbError> {
        for data in self.0 {
            let GroupDataUpdateRequest {
                user_vault_id,
                data_group_priority,
                data_group_kind,
                data,
            } = data;

            // generate uuid for checking they're in the same group: todo, check collisions
            // earlier
            let group_id = DataGroupId::generate();
            let updates: Vec<NewUserData> = data
                .into_iter()
                .map(|update_data| {
                    let UserDataUpdate {
                        data_kind,
                        e_data,
                        sh_data,
                        is_verified,
                    } = update_data;
                    NewUserData {
                        user_vault_id: user_vault_id.clone(),
                        data_kind,
                        data_group_id: group_id.clone(),
                        data_group_kind,
                        data_group_priority,
                        e_data,
                        sh_data,
                        is_verified,
                    }
                })
                .collect();
            GroupInsert(updates).group_insert(conn)?;
        }
        Ok(())
    }
}
