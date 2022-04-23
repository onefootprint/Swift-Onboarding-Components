use crate::schema::fp_user;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "fp_user"]
pub struct FpUser {
    pub id: Uuid,
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
    pub is_email_verified: Option<bool>,
    pub sh_email: Option<Vec<u8>>,
    pub e_phone_number: Option<Vec<u8>>,
    pub is_phone_number_verified: Option<bool>,
    pub sh_phone_number: Option<Vec<u8>>,
    pub id_verified: Status
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "fp_user"]
pub struct NewFpUser {
    pub e_private_key: Vec<u8>,
    pub public_key: Vec<u8>,
    pub id_verified: Status
}
#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "fp_user"]
pub struct PartialFpUser {
    pub id: Uuid,
    pub public_key: Vec<u8>,
}
