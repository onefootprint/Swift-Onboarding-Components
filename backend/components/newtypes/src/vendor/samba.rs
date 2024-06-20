use crate::util::impl_enum_str_diesel;
use crate::PiiString;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Clone,
    Copy,
    Display,
    DeserializeFromStr,
    SerializeDisplay,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum SambaOrderKind {
    LicenseValidation,
    ActivityHistory,
}

impl_enum_str_diesel!(SambaOrderKind);

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct SambaAddress {
    pub street: PiiString,
    pub city: PiiString,
    pub state: PiiString,
    pub zip_code: PiiString,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct SambaLicenseValidationData {
    pub first_name: PiiString,
    pub last_name: PiiString,
    pub license_number: PiiString,
    pub license_state: PiiString,
    pub dob: Option<PiiString>,
    pub license_category: Option<PiiString>,
    pub issue_date: Option<PiiString>,
    pub expiry_date: Option<PiiString>,
    pub gender: Option<PiiString>,
    pub eye_color: Option<PiiString>,
    pub height: Option<u16>,
    pub weight: Option<u16>,
    pub address: Option<SambaAddress>,
    pub middle_name: Option<PiiString>,
}
