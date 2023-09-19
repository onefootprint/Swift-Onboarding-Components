use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, Display, EnumString};

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
    JsonSchema,
    Eq,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentScanDeviceType {
    Desktop,
    Mobile,
}
crate::util::impl_enum_str_diesel!(DocumentScanDeviceType);
