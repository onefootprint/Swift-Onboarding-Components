use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::Display;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

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
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BusinessOwnerKind {
    /// The BusinessOwner filled out the initial KYB form for this business
    Primary,
    Secondary,
}

crate::util::impl_enum_str_diesel!(BusinessOwnerKind);

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
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BusinessOwnerSource {
    /// Created via a Footprint-hosted flow, bifrost
    Hosted,
    /// Created via tenant-facing API
    Tenant,
}

crate::util::impl_enum_string_diesel!(BusinessOwnerSource);
