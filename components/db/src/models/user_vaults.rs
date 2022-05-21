use std::collections::HashMap;

use crate::diesel::RunQueryDsl;
use crate::schema::user_vaults;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use newtypes::{DataKind, Status, UserVaultId};
use serde::{Deserialize, Serialize};

use super::user_data::UserData;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "user_vaults"]
pub struct UserVault {
    pub id: UserVaultId,
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    // TODO remove these
    pub e_phone_number: Vec<u8>,
    pub sh_phone_number: Vec<u8>,
    pub id_verified: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_vaults"]
pub struct NewUserVault {
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub id_verified: Status,
    // TODO remove these
    pub e_phone_number: Vec<u8>,
    pub sh_phone_number: Vec<u8>,
}

impl NewUserVault {
    pub async fn save(self, pool: &DbPool) -> Result<UserVault, crate::DbError> {
        let user_vault = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(user_vaults::table)
                    .values(self)
                    .get_result::<UserVault>(conn)
            })
            .await??;
        Ok(user_vault)
    }
}

pub struct UserVaultWrapper<'a> {
    user_vault: &'a UserVault,
    user_data: HashMap<DataKind, Vec<UserData>>,
}

impl<'a> UserVaultWrapper<'a> {
    pub async fn from(
        pool: &DbPool,
        user_vault: &'a UserVault,
    ) -> Result<UserVaultWrapper<'a>, crate::DbError> {
        Ok(Self {
            user_data: crate::user_data::list(pool, user_vault.id.clone()).await?,
            user_vault,
        })
    }

    pub fn get_field(&self, data_kind: DataKind) -> Option<&[u8]> {
        // TODO handle multiple values for the same field
        match data_kind {
            DataKind::PhoneNumber => Some(&self.user_vault.e_phone_number),
            _ => Some(&self.user_data.get(&data_kind)?.get(0)?.e_data),
        }
        .map(Vec::as_slice)
    }

    pub fn missing_fields(&self) -> Vec<DataKind> {
        vec![
            DataKind::FirstName,
            DataKind::LastName,
            DataKind::Dob,
            DataKind::Ssn,
            DataKind::StreetAddress,
            DataKind::City,
            DataKind::State,
            DataKind::Zip,
            DataKind::Country,
            DataKind::Email,
            DataKind::PhoneNumber,
        ]
        .into_iter()
        .filter(|data_kind| self.get_field(*data_kind).is_none())
        .collect()
    }
}
