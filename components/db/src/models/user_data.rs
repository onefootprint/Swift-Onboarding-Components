use std::collections::HashSet;

use crate::diesel::RunQueryDsl;
use crate::schema::user_data;
use chrono::{DateTime, Utc};
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
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

impl UserData {
    pub fn mark_verified(
        conn: &mut PgConnection,
        id: &UserDataId,
        data_kind: DataKind,
    ) -> Result<UserData, crate::DbError> {
        let result = diesel::update(user_data::table)
            .filter(user_data::id.eq(id))
            .filter(user_data::data_kind.eq(data_kind))
            .set(user_data::is_verified.eq(true))
            .get_result::<UserData>(conn)?;
        Ok(result)
    }

    pub fn bulk_insert(conn: &mut PgConnection, data: Vec<NewUserData>) -> Result<Vec<Self>, crate::DbError> {
        let group_ids: HashSet<&DataGroupId> = data.iter().map(|x| &x.data_group_id).collect();
        let existing_groups: Vec<UserData> = user_data::table
            .filter(user_data::data_group_id.eq_any(group_ids))
            .get_results(conn)?;
        if !existing_groups.is_empty() {
            return Err(crate::DbError::CouldNotCreateGroupUuid);
        }
        let results = diesel::insert_into(user_data::table)
            .values(data)
            .get_results(conn)?;
        Ok(results)
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
    pub fn bulk_insert(self, conn: &mut PgConnection) -> Result<Vec<UserData>, crate::DbError> {
        let new_user_datas = self
            .0
            .into_iter()
            .flat_map(|data_group| {
                let GroupDataUpdateRequest {
                    user_vault_id,
                    data_group_priority,
                    data_group_kind,
                    data,
                } = data_group;
                // generate uuid for grouping data
                let group_id = DataGroupId::generate();
                data.into_iter().map(move |new_data| {
                    let UserDataUpdate {
                        data_kind,
                        e_data,
                        sh_data,
                        is_verified,
                    } = new_data;
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
            })
            .collect::<Vec<NewUserData>>();
        let results = UserData::bulk_insert(conn, new_user_datas)?;
        Ok(results)
    }
}
