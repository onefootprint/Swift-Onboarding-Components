use crate::DataIdentifier;
use crate::DocumentDiKind;
use crate::DocumentUploadSettings;
use crate::NtResult;
use crate::ValidationError;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::EnumDiscriminants;
use strum::EnumIter;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug, Clone, Serialize, Deserialize, AsJsonb, EnumDiscriminants, Apiv2Schema, derive_more::IsVariant,
)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[strum_discriminants(
    name(DocumentRequestKind),
    derive(
        Display,
        Ord,
        PartialOrd,
        AsExpression,
        FromSqlRow,
        EnumString,
        SerializeDisplay,
        DeserializeFromStr,
        macros::SerdeAttr,
        Apiv2Schema,
        EnumIter,
        derive_more::IsVariant
    ),
    vis(pub),
    strum(serialize_all = "snake_case"),
    diesel(sql_type = Text)
)]
pub enum DocumentRequestConfig {
    Identity {
        collect_selfie: bool,
    },
    ProofOfSsn {
        #[serde(default = "yes")]
        requires_human_review: bool,
    },
    ProofOfAddress {
        #[serde(default = "yes")]
        requires_human_review: bool,
    },
    Custom(CustomDocumentConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, macros::SerdeAttr)]
#[serde(rename_all = "snake_case")]
pub struct CustomDocumentConfig {
    /// Custom document identifier under which the document will be vaulted
    pub identifier: DataIdentifier,
    /// The human-readable name of the document to display to the user
    pub name: String,
    /// Optional human-readable description of the document that will be displayed to the user
    pub description: Option<String>,
    #[serde(default = "yes")]
    pub requires_human_review: bool,
    #[serde(default = "prefer_upload")]
    pub upload_settings: DocumentUploadSettings,
}

fn yes() -> bool {
    true
}

fn prefer_upload() -> DocumentUploadSettings {
    DocumentUploadSettings::PreferUpload
}

impl DocumentRequestKind {
    pub fn should_initiate_incode_requests(&self) -> bool {
        self.is_identity()
    }
}

impl DocumentRequestConfig {
    pub fn validate(configs: &[Self]) -> NtResult<()> {
        if configs
            .iter()
            .filter(|d| matches!(d, DocumentRequestConfig::ProofOfAddress { .. }))
            .count()
            > 1
        {
            return ValidationError("Can only collect one proof of address doc").into();
        }

        if configs
            .iter()
            .filter(|d| matches!(d, DocumentRequestConfig::ProofOfSsn { .. }))
            .count()
            > 1
        {
            return ValidationError("Can only collect one proof of SSN doc").into();
        }

        // Custom doc validation

        let custom_docs = configs
            .iter()
            .filter_map(|d| match d {
                DocumentRequestConfig::Custom(i) => Some(i),
                _ => None,
            })
            .collect_vec();

        let num_identifiers = custom_docs.iter().map(|d| &d.identifier).unique().count();
        if num_identifiers != custom_docs.len() {
            return ValidationError("Cannot specify the same identifier for multiple custom documents")
                .into();
        }
        if custom_docs
            .iter()
            .any(|d| !matches!(d.identifier, DataIdentifier::Document(DocumentDiKind::Custom(_))))
        {
            return ValidationError(
                "Must use identifier starting with document.custom. for custom documents",
            )
            .into();
        }
        if custom_docs.iter().any(|d| d.name.is_empty()) {
            return ValidationError("Custom document name cannot be empty").into();
        }

        Ok(())
    }
}

crate::util::impl_enum_string_diesel!(DocumentRequestKind);
