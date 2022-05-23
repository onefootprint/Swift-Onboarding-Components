use std::collections::HashMap;

use crate::schema::user_vaults;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, PgConnection};
use newtypes::{DataKind, Status, UserVaultId};
use serde::{Deserialize, Serialize};

use super::user_data::UserData;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "user_vaults"]
pub struct UserVault {
    pub id: UserVaultId,
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
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
}

pub struct NewUserVaultReq {
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub id_verified: Status,
    // Note: these aren't actual columns on the table -
    pub e_phone_number: Vec<u8>,
    pub sh_phone_number: Vec<u8>,
}

pub struct UserVaultWrapper {
    _user_vault: UserVault,
    user_data: HashMap<DataKind, Vec<UserData>>,
}

impl UserVaultWrapper {
    pub async fn from(
        pool: &DbPool,
        user_vault: UserVault,
    ) -> Result<UserVaultWrapper, crate::DbError> {
        let result: UserVaultWrapper = pool
            .get()
            .await?
            .interact(move |conn| {
                Self::from_conn(conn, user_vault)
            })
            .await??;
        Ok(result)
    }

    pub fn from_conn(
        conn: &mut PgConnection,
        user_vault: UserVault,
    ) -> Result<UserVaultWrapper, crate::DbError> {
        Ok(Self {
            user_data: crate::user_data::list(conn, user_vault.id.clone())?,
            _user_vault: user_vault,
        })
    }

    pub fn get_data(&self, data_kind: DataKind) -> Option<&UserData> {
        // TODO handle multiple values for the same field
        self.user_data.get(&data_kind)?.get(0)
    }

    pub fn get_e_field(&self, data_kind: DataKind) -> Option<&[u8]> {
        // TODO handle multiple values for the same field
        Some(self.get_data(data_kind)?.e_data.as_slice())
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
        .filter(|data_kind| self.get_e_field(*data_kind).is_none())
        .collect()
    }
}
