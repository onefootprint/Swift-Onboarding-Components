use crate::errors::DbError;
use crate::schema::user_vaults;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, QueryDsl, Queryable};
use newtypes::{Status, UserVaultId};
use serde::{Deserialize, Serialize};

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

impl UserVault {
    pub fn lock(conn: &PgConnection, id: UserVaultId) -> Result<Self, DbError> {
        let user = user_vaults::table
            .for_no_key_update()
            .filter(user_vaults::id.eq(id))
            .first(conn)?;
        Ok(user)
    }
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
