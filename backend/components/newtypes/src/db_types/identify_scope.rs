use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use strum_macros::{Display, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    EnumString,
    serde_with::DeserializeFromStr,
    macros::SerdeAttr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IdentifyScope {
    My1fp,
    Onboarding,
    Auth,
}

crate::util::impl_enum_string_diesel!(IdentifyScope);
