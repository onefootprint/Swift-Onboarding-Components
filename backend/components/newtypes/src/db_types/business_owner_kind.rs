use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::Display;
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BusinessOwnerKind {
    /// The BusinessOwner filled out the initial KYB form for this business
    Primary,
    Secondary,
}

crate::util::impl_enum_str_diesel!(BusinessOwnerKind);
