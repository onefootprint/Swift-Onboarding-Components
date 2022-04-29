use crate::schema::user_vaults;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

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
    pub is_email_verified: bool,
    pub sh_email: Option<Vec<u8>>,
    pub e_phone_number: Option<Vec<u8>>,
    pub is_phone_number_verified: bool,
    pub sh_phone_number: Option<Vec<u8>>,
    pub id_verified: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime
}



#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
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
    pub e_email: Option<Vec<u8>>,
    pub is_email_verified: Option<bool>,
    pub sh_email: Option<Vec<u8>>,
    pub e_phone_number: Option<Vec<u8>>,
    pub is_phone_number_verified: Option<bool>,
    pub sh_phone_number: Option<Vec<u8>>,
    pub id_verified: Status
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_vaults"]
pub struct NewUserVault {
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub id_verified: Status,
    pub is_phone_number_verified: bool,
    pub is_email_verified: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_vaults"]
pub struct PartialUserVault {
    pub id: String,
    pub public_key: Vec<u8>,
}
