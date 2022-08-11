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

use super::user_vaults::UserVault;

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

    pub fn get(
        conn: &mut PgConnection,
        id: &UserDataId,
        user_vault_id: &UserVaultId,
    ) -> Result<(UserData, UserVault), crate::DbError> {
        use crate::schema::user_vaults;
        let result = user_data::table
            .inner_join(user_vaults::table)
            .filter(user_data::id.eq(id))
            .filter(user_data::user_vault_id.eq(user_vault_id))
            .get_result(conn)?;
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
