use crate::util::impl_enum_str_diesel;
use crate::CollectedDataOption as CDO;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json;
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Eq,
    PartialEq,
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
#[derive(Default)]
pub enum ApiKeyStatus {
    #[default]
    Disabled,
    Enabled,
}

impl_enum_str_diesel!(ApiKeyStatus);

#[derive(
    Eq,
    PartialEq,
    Serialize,
    Deserialize,
    Debug,
    Display,
    Clone,
    Copy,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum CipKind {
    Alpaca,
    Apex,
}

impl_enum_str_diesel!(CipKind);

impl CipKind {
    pub fn required_cdos(&self) -> Vec<CDO> {
        match self {
            CipKind::Alpaca => vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress, CDO::Nationality],
            CipKind::Apex => vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum EnhancedAmlOption {
    No,
    Yes {
        ofac: bool,
        pep: bool,
        adverse_media: bool,
        continuous_monitoring: bool,
    },
}
