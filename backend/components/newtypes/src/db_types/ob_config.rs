use crate::util::impl_enum_str_diesel;
use crate::CollectedDataOption as CDO;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use serde_json;
use strum::IntoEnumIterator;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

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
    Debug,
    Display,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    serde_with::DeserializeFromStr,
    serde_with::SerializeDisplay,
    Apiv2Schema,
    macros::SerdeAttr,
    EnumIter,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ObConfigurationKind {
    Kyc,
    Kyb,
    Auth,
    Document,
}

impl_enum_str_diesel!(ObConfigurationKind);

impl ObConfigurationKind {
    /// Returns the list of Playbook kinds that can be "re-onboarded" onto
    pub fn reonboardable() -> Vec<Self> {
        Self::iter()
            .filter(|cdo| match cdo {
                Self::Kyb | Self::Kyc => true,
                // Technically, Document is "re-onboardable" because it has a Workflow. But
                // behavior is probably not such that when requesting "Redo KYC" from the workflow
                // that you want them to redo the Document playbook they onboarded onto
                Self::Auth | Self::Document => false,
            })
            .collect()
    }

    /// Returns true if this playbook can be "onboarded" onto
    pub fn can_onboard(&self) -> bool {
        match self {
            Self::Kyb | Self::Kyc | Self::Document => true,
            Self::Auth => false,
        }
    }
}

#[derive(
    Eq,
    PartialEq,
    Debug,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Display,
    serde_with::DeserializeFromStr,
    serde_with::SerializeDisplay,
    Apiv2Schema,
    macros::SerdeAttr,
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
            CipKind::Alpaca => vec![CDO::Name, CDO::Dob, CDO::Ssn9, CDO::FullAddress],
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
        adverse_media_lists: Option<Vec<AdverseMediaListKind>>,
    },
}

impl EnhancedAmlOption {
    pub fn adverse_media_lists(&self) -> Vec<AdverseMediaListKind> {
        match self {
            EnhancedAmlOption::No => vec![],
            EnhancedAmlOption::Yes {
                ofac: _,
                pep: _,
                adverse_media: _,
                continuous_monitoring: _,
                adverse_media_lists,
            } => adverse_media_lists
                .clone()
                .unwrap_or(AdverseMediaListKind::default_lists()),
        }
    }
}

#[derive(
    Eq,
    PartialEq,
    Debug,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    Hash,
    AsRefStr,
    serde_with::DeserializeFromStr,
    Serialize,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AdverseMediaListKind {
    FinancialCrime,
    ViolentCrime,
    SexualCrime,
    CyberCrime,
    Terrorism,
    Fraud,
    Narcotics,
    GeneralSerious,
    GeneralMinor,
}

impl_enum_str_diesel!(AdverseMediaListKind);

impl AdverseMediaListKind {
    pub fn default_lists() -> Vec<AdverseMediaListKind> {
        AdverseMediaListKind::iter().collect()
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, Eq, PartialEq, Apiv2Schema)]
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
                adverse_media_lists: value.adverse_media.then(AdverseMediaListKind::default_lists),
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
                adverse_media_lists: _,
            } => EnhancedAml {
                enhanced_aml: true,
                ofac,
                pep,
                adverse_media,
            },
        }
    }
}
