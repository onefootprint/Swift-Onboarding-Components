use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde_json;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum::AsRefStr;
use strum_macros::{
    Display,
    EnumString,
};

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum VaultKind {
    Person,
    Business,
}

impl_enum_str_diesel!(VaultKind);
