use chrono::Duration;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::SerializeDisplay;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    SerializeDisplay,
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

#[derive(
    Debug, Display, Clone, Copy, EnumString, serde_with::DeserializeFromStr, macros::SerdeAttr, Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum RequestedTokenScope {
    Auth,
    Onboarding,
    My1fp,
    OnboardingComponents,
}

impl From<IdentifyScope> for RequestedTokenScope {
    fn from(value: IdentifyScope) -> Self {
        match value {
            IdentifyScope::Auth => Self::Auth,
            IdentifyScope::Onboarding => Self::Onboarding,
            IdentifyScope::My1fp => Self::My1fp,
        }
    }
}
