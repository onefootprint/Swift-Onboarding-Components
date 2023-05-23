use crate::{
    CollectedData, DataIdentifier, DocumentSide, IdDocKind, IsDataIdentifierDiscriminant, StorageType,
    Validate, ValidateArgs,
};
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
    #[strum(to_string = "passport.selfie", serialize = "passport_selfie")]
    PassportSelfie,
    #[strum(to_string = "drivers_license.front", serialize = "drivers_license_front")]
    DriversLicenseFront,
    #[strum(to_string = "drivers_license.back", serialize = "drivers_license_back")]
    DriversLicenseBack,
    #[strum(to_string = "drivers_license.selfie", serialize = "drivers_license_selfie")]
    DriversLicenseSelfie,
    #[strum(to_string = "id_card.front", serialize = "id_card_front")]
    IdCardFront,
    #[strum(to_string = "id_card.back", serialize = "id_card_back")]
    IdCardBack,
    #[strum(to_string = "id_card.selfie", serialize = "id_card_selfie")]
    IdCardSelfie,
    /// Letter signed by a compliance officer granting permission to carry an account, required by FINFRA rules in certain cases
    FinraComplianceLetter,

    #[strum(to_string = "passport.number")]
    PassportNumber,
    #[strum(to_string = "passport.expiration")]
    PassportExpiration,
    #[strum(to_string = "passport.dob")]
    PassportDob,
    #[strum(to_string = "drivers_license.number")]
    DriversLicenseNumber,
    #[strum(to_string = "drivers_license.expiration")]
    DriversLicenseExpiration,
    #[strum(to_string = "drivers_license.dob")]
    DriversLicenseDob,
    #[strum(to_string = "drivers_license.issuing_state")]
    DriversLicenseIssuingState,
    #[strum(to_string = "id_card.number")]
    IdCardNumber,
    #[strum(to_string = "id_card.expiration")]
    IdCardExpiration,
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
            DocumentKind::PassportNumber
            | DocumentKind::PassportExpiration
            | DocumentKind::PassportDob
            | DocumentKind::DriversLicenseNumber
            | DocumentKind::DriversLicenseExpiration
            | DocumentKind::DriversLicenseDob
            | DocumentKind::DriversLicenseIssuingState
            | DocumentKind::IdCardNumber
            | DocumentKind::IdCardExpiration => true,
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
            // allow storing this data independently
            DocumentKind::PassportNumber
            | DocumentKind::PassportExpiration
            | DocumentKind::PassportDob
            | DocumentKind::DriversLicenseNumber
            | DocumentKind::DriversLicenseExpiration
            | DocumentKind::DriversLicenseDob
            | DocumentKind::DriversLicenseIssuingState
            | DocumentKind::IdCardNumber
            | DocumentKind::IdCardExpiration => None,
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
            DocumentKind::PassportNumber
            | DocumentKind::PassportExpiration
            | DocumentKind::PassportDob
            | DocumentKind::DriversLicenseNumber
            | DocumentKind::DriversLicenseExpiration
            | DocumentKind::DriversLicenseDob
            | DocumentKind::DriversLicenseIssuingState
            | DocumentKind::IdCardNumber
            | DocumentKind::IdCardExpiration => vec![],
        }
    }

    pub fn from_id_doc_kind(kind: IdDocKind, side: DocumentSide) -> Self {
        match (kind, side) {
            (IdDocKind::IdCard, DocumentSide::Front) => Self::IdCardFront,
            (IdDocKind::IdCard, DocumentSide::Back) => Self::IdCardBack,
            (IdDocKind::IdCard, DocumentSide::Selfie) => Self::IdCardSelfie,
            (IdDocKind::DriverLicense, DocumentSide::Front) => Self::DriversLicenseFront,
            (IdDocKind::DriverLicense, DocumentSide::Back) => Self::DriversLicenseBack,
            (IdDocKind::DriverLicense, DocumentSide::Selfie) => Self::DriversLicenseSelfie,
            (IdDocKind::Passport, DocumentSide::Front) => Self::Passport,
            (IdDocKind::Passport, DocumentSide::Back) => Self::Passport,
            (IdDocKind::Passport, DocumentSide::Selfie) => Self::PassportSelfie,
        }
    }
}

impl DocumentKind {
    /// defines how the encrypted bytes of the data identifier is stored
    pub fn storage_type(&self) -> StorageType {
        match self {
            DocumentKind::Passport
            | DocumentKind::PassportSelfie
            | DocumentKind::DriversLicenseFront
            | DocumentKind::DriversLicenseBack
            | DocumentKind::DriversLicenseSelfie
            | DocumentKind::IdCardFront
            | DocumentKind::IdCardBack
            | DocumentKind::IdCardSelfie
            | DocumentKind::FinraComplianceLetter => StorageType::S3,
            DocumentKind::PassportNumber
            | DocumentKind::PassportExpiration
            | DocumentKind::PassportDob
            | DocumentKind::DriversLicenseNumber
            | DocumentKind::DriversLicenseExpiration
            | DocumentKind::DriversLicenseDob
            | DocumentKind::DriversLicenseIssuingState
            | DocumentKind::IdCardNumber
            | DocumentKind::IdCardExpiration => StorageType::VaultData,
        }
    }
}

impl DocumentKind {
    pub fn searchable() -> Vec<Self> {
        vec![
            Self::PassportNumber,
            Self::DriversLicenseNumber,
            Self::IdCardNumber,
        ]
    }

    pub fn is_searchable(&self) -> bool {
        Self::searchable().contains(self)
    }
}
