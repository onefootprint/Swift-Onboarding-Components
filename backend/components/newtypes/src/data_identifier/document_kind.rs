use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, Validate};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use mime::Mime;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    Hash,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentKind {
    /// Letter signed by a compliance officer granting permission to carry an account, required by FINFRA rules in certain cases
    FinraComplianceLetter,
}
// TODO: one day merge IdDocKind into here

crate::util::impl_enum_str_diesel!(DocumentKind);

impl From<DocumentKind> for DataIdentifier {
    fn from(value: DocumentKind) -> Self {
        Self::Document(value)
    }
}

impl TryFrom<DataIdentifier> for DocumentKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Document(dk) => Ok(dk),
            _ => Err(crate::Error::Custom("Can't convert into DocumentKind".to_owned())),
        }
    }
}

impl Validate for DocumentKind {
    // TODO this isn't used for DocumentKind since the input isn't a PiiString, but we have to implement
    // it in order to implement IsDataIdentifierDiscriminant. Maybe in the future we can split this functionality out
    fn validate(&self, value: crate::PiiString, _for_bifrost: bool) -> crate::NtResult<crate::PiiString> {
        Ok(value)
    }
}

impl IsDataIdentifierDiscriminant for DocumentKind {
    fn is_optional(&self) -> bool {
        false
    }

    fn parent(&self) -> Option<CollectedData> {
        Some(CollectedData::InvestorProfile)
    }
}

impl DocumentKind {
    pub fn accepted_mime_types(&self) -> Vec<Mime> {
        match self {
            DocumentKind::FinraComplianceLetter => vec![mime::APPLICATION_PDF],
        }
    }
}
