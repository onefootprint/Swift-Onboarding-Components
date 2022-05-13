use crate::diesel::RunQueryDsl;
use crate::schema::user_vaults;
use crate::{models::types::Status, DbPool};
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "user_vaults"]
pub struct UserVault {
    pub id: String,
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub e_first_name: Option<Vec<u8>>,
    pub e_last_name: Option<Vec<u8>>,
    pub e_dob: Option<Vec<u8>>,
    pub e_ssn: Option<Vec<u8>>,
    pub sh_ssn: Option<Vec<u8>>,
    pub e_street_address: Option<Vec<u8>>,
    pub e_city: Option<Vec<u8>>,
    pub e_state: Option<Vec<u8>>,
    pub e_email: Option<Vec<u8>>,
    pub sh_email: Option<Vec<u8>>,
    pub is_email_verified: bool,
    pub e_phone_number: Vec<u8>,
    pub sh_phone_number: Vec<u8>,
    pub id_verified: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "user_vaults"]
pub struct UpdateUserVault {
    pub id: String,
    pub e_first_name: Option<Vec<u8>>,
    pub e_last_name: Option<Vec<u8>>,
    pub e_dob: Option<Vec<u8>>,
    pub e_ssn: Option<Vec<u8>>,
    pub sh_ssn: Option<Vec<u8>>,
    pub e_street_address: Option<Vec<u8>>,
    pub e_city: Option<Vec<u8>>,
    pub e_state: Option<Vec<u8>>,
    pub e_phone_number: Option<Vec<u8>>,
    pub sh_phone_number: Option<Vec<u8>>,
    pub e_email: Option<Vec<u8>>,
    pub sh_email: Option<Vec<u8>>,
    pub is_email_verified: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_vaults"]
pub struct NewUserVault {
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub id_verified: Status,
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

pub trait MissingFields {
    // returns vector of missing attributes
    fn missing_fields(&self) -> Vec<String>;
}

impl MissingFields for UserVault {
    fn missing_fields(&self) -> Vec<String> {
        let attrs = vec![
            ("first_name", self.e_first_name.clone()),
            ("last_name", self.e_last_name.clone()),
            ("date_of_birth", self.e_dob.clone()),
            ("ssn", self.e_ssn.clone()),
            ("street_address", self.e_street_address.clone()),
            ("city", self.e_city.clone()),
            ("state", self.e_state.clone()),
        ];
        attrs
            .iter()
            .filter(|(_, val)| val.is_none())
            .map(|(name, _)| name.to_owned().to_owned())
            .collect()
    }
}
