use crate::{CollectedData, DataIdentifier, IdDocKind, IsDataIdentifierDiscriminant, Validate, ValidateArgs};
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
    Passport,
    PassportSelfie,
    DriversLicenseFront,
    DriversLicenseBack,
    DriversLicenseSelfie,
    IdCardFront,
    IdCardBack,
    IdCardSelfie,
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
    fn validate(&self, value: crate::PiiString, _args: ValidateArgs) -> crate::NtResult<crate::PiiString> {
        Ok(value)
    }
}

impl IsDataIdentifierDiscriminant for DocumentKind {
    fn is_optional(&self) -> bool {
        match self {
            DocumentKind::FinraComplianceLetter => true,
            DocumentKind::Passport => true,
            DocumentKind::PassportSelfie => true,
            DocumentKind::IdCardFront => true,
            DocumentKind::IdCardBack => true,
            DocumentKind::IdCardSelfie => true,
            DocumentKind::DriversLicenseFront => true,
            DocumentKind::DriversLicenseBack => true,
            DocumentKind::DriversLicenseSelfie => true,
        }
    }

    fn parent(&self) -> Option<CollectedData> {
        match self {
            DocumentKind::Passport
            | DocumentKind::IdCardFront
            | DocumentKind::IdCardBack
            | DocumentKind::DriversLicenseFront
            | DocumentKind::DriversLicenseBack
            | DocumentKind::DriversLicenseSelfie
            | DocumentKind::IdCardSelfie
            | DocumentKind::PassportSelfie => Some(CollectedData::Document),
            DocumentKind::FinraComplianceLetter => Some(CollectedData::InvestorProfile),
        }
    }
}

impl DocumentKind {
    pub fn accepted_mime_types(&self) -> Vec<Mime> {
        match self {
            DocumentKind::Passport
            | DocumentKind::IdCardFront
            | DocumentKind::IdCardBack
            | DocumentKind::DriversLicenseFront
            | DocumentKind::DriversLicenseBack => {
                vec![mime::APPLICATION_PDF, mime::IMAGE_JPEG, mime::IMAGE_PNG]
            }
            DocumentKind::DriversLicenseSelfie
            | DocumentKind::IdCardSelfie
            | DocumentKind::PassportSelfie => vec![mime::IMAGE_JPEG, mime::IMAGE_PNG],
            DocumentKind::FinraComplianceLetter => vec![mime::APPLICATION_PDF],
        }
    }

    pub fn from_id_doc_kind(kind: IdDocKind) -> Self {
        match kind {
            IdDocKind::IdCard => Self::IdCardFront,
            IdDocKind::DriverLicense => Self::DriversLicenseFront,
            IdDocKind::Passport => Self::Passport,
        }
    }

    pub fn from_id_doc_kind_back(kind: IdDocKind) -> Self {
        match kind {
            IdDocKind::IdCard => Self::IdCardBack,
            IdDocKind::DriverLicense => Self::DriversLicenseBack,
            IdDocKind::Passport => Self::Passport,
        }
    }
    pub fn from_id_doc_kind_selfie(kind: IdDocKind) -> Self {
        match kind {
            IdDocKind::IdCard => Self::IdCardSelfie,
            IdDocKind::DriverLicense => Self::DriversLicenseSelfie,
            IdDocKind::Passport => Self::PassportSelfie,
        }
    }
}
