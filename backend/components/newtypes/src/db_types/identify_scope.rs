use chrono::Duration;
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

impl IdentifyScope {
    pub fn token_ttl(&self) -> Duration {
        match self {
            IdentifyScope::My1fp => Duration::hours(8),
            IdentifyScope::Auth => Duration::hours(1),
            IdentifyScope::Onboarding => Duration::hours(1),
        }
    }
}

crate::util::impl_enum_string_diesel!(IdentifyScope);
