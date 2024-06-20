use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

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
