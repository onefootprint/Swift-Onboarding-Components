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

#[derive(Debug, Default, Clone, Serialize, Deserialize, Eq, PartialEq, Apiv2Schema, JsonSchema)]
pub struct EnhancedAml {
    pub enhanced_aml: bool,
    pub ofac: bool,
    pub pep: bool,
    pub adverse_media: bool,
}

impl From<EnhancedAml> for EnhancedAmlOption {
    fn from(value: EnhancedAml) -> Self {
        if value.enhanced_aml {
            EnhancedAmlOption::Yes {
                ofac: value.ofac,
                pep: value.pep,
                adverse_media: value.adverse_media,
                continuous_monitoring: true,
            }
        } else {
            EnhancedAmlOption::No
        }
    }
}

impl From<EnhancedAmlOption> for EnhancedAml {
    fn from(value: EnhancedAmlOption) -> Self {
        match value {
            EnhancedAmlOption::No => EnhancedAml {
                enhanced_aml: false,
                ofac: false,
                pep: false,
                adverse_media: false,
            },
            EnhancedAmlOption::Yes {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring: _,
            } => EnhancedAml {
                enhanced_aml: true,
                ofac,
                pep,
                adverse_media,
            },
        }
    }
}
