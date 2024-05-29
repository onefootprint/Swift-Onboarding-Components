use derive_more::Display;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use strum_macros::{
    AsRefStr,
    EnumString,
};

#[derive(
    Debug,
    Display,
    Eq,
    PartialEq,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "lowercase")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
pub enum AttestationType {
    None,
    Unknown,
    Apple,
    AppleApp,
    AndroidKey,
    AndroidSafetyNet,
}

crate::util::impl_enum_str_diesel!(AttestationType);
