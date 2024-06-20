use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use macros::SerdeAttr;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    PartialEq,
    Eq,
    SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DeviceType {
    Desktop,
    Mobile,
}
crate::util::impl_enum_str_diesel!(DeviceType);
