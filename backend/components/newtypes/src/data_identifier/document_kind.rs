use crate::{
    AllData, CollectedData, DataIdentifier, DocumentSide, IdDocKind, IsDataIdentifierDiscriminant, NtResult,
    PiiString, StorageType, Validate, ValidateArgs,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use mime::Mime;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::IntoEnumIterator;
use strum_macros::AsRefStr;
use strum_macros::{Display, EnumDiscriminants, EnumIter, EnumString};

#[derive(
    Debug,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    PartialEq,
    Eq,
    Hash,
    AsExpression,
    FromSqlRow,
    EnumDiscriminants,
)]
#[strum_discriminants(name(DocumentKindDiscriminant))]
#[strum_discriminants(derive(EnumString, AsRefStr, Display, EnumIter))]
#[diesel(sql_type = Text)]
pub enum DocumentKind {
    #[strum_discriminants(strum(to_string = "passport"))]
    Passport,
    #[strum_discriminants(strum(to_string = "passport.selfie"))]
    PassportSelfie,

    #[strum_discriminants(strum(to_string = "drivers_license.front"))]
    DriversLicenseFront,
    #[strum_discriminants(strum(to_string = "drivers_license.back"))]
    DriversLicenseBack,
    #[strum_discriminants(strum(to_string = "drivers_license.selfie"))]
    DriversLicenseSelfie,

    #[strum_discriminants(strum(to_string = "id_card.front"))]
    IdCardFront,
    #[strum_discriminants(strum(to_string = "id_card.back"))]
    IdCardBack,
    #[strum_discriminants(strum(to_string = "id_card.selfie"))]
    IdCardSelfie,

    /// Letter signed by a compliance officer granting permission to carry an account, required by FINFRA rules in certain cases
    #[strum_discriminants(strum(to_string = "finra_compliance_letter"))]
    FinraComplianceLetter,

    #[strum_discriminants(strum(to_string = "passport.number"))]
    PassportNumber,
    #[strum_discriminants(strum(to_string = "passport.expiration"))]
    PassportExpiration,
    #[strum_discriminants(strum(to_string = "passport.dob"))]
    PassportDob,
    #[strum_discriminants(strum(to_string = "drivers_license.number"))]
    DriversLicenseNumber,
    #[strum_discriminants(strum(to_string = "drivers_license.expiration"))]
    DriversLicenseExpiration,
    #[strum_discriminants(strum(to_string = "drivers_license.dob"))]
    DriversLicenseDob,
    #[strum_discriminants(strum(to_string = "drivers_license.issuing_state"))]
    DriversLicenseIssuingState,
    #[strum_discriminants(strum(to_string = "id_card.number"))]
    IdCardNumber,
    #[strum_discriminants(strum(to_string = "id_card.expiration"))]
    IdCardExpiration,

    /// represents the latest upload of a document
    /// document.[doc_kind].[side].latest_upload
    #[strum_discriminants(strum(to_string = "latest_upload"))]
    LatestUpload(IdDocKind, DocumentSide),

    /// represents the mime type of a document
    /// document.[doc_kind].[side].mime_type
    #[strum_discriminants(strum(to_string = "mime_type"))]
    MimeType(IdDocKind, DocumentSide),
}

crate::util::impl_enum_string_diesel!(DocumentKind);

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
    fn validate(&self, value: PiiString, _: ValidateArgs, _: &AllData) -> NtResult<PiiString> {
        Ok(value)
    }
}

impl IsDataIdentifierDiscriminant for DocumentKind {
    fn is_optional(&self) -> bool {
        match self {
            DocumentKind::FinraComplianceLetter
            | DocumentKind::Passport
            | DocumentKind::PassportSelfie
            | DocumentKind::IdCardFront
            | DocumentKind::IdCardBack
            | DocumentKind::IdCardSelfie
            | DocumentKind::DriversLicenseFront
            | DocumentKind::DriversLicenseBack
            | DocumentKind::DriversLicenseSelfie
            | DocumentKind::PassportNumber
            | DocumentKind::PassportExpiration
            | DocumentKind::PassportDob
            | DocumentKind::DriversLicenseNumber
            | DocumentKind::DriversLicenseExpiration
            | DocumentKind::DriversLicenseDob
            | DocumentKind::DriversLicenseIssuingState
            | DocumentKind::IdCardNumber
            | DocumentKind::IdCardExpiration
            | DocumentKind::MimeType(_, _) => true,
            DocumentKind::LatestUpload(_, _) => true,
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
            | DocumentKind::IdCardExpiration
            | DocumentKind::MimeType(_, _)
            | DocumentKind::LatestUpload(_, _) => None,
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
            | DocumentKind::IdCardExpiration
            | DocumentKind::MimeType(_, _)
            | DocumentKind::LatestUpload(_, _) => vec![],
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
            | DocumentKind::FinraComplianceLetter
            | DocumentKind::LatestUpload(_, _) => StorageType::DocumentData,
            DocumentKind::MimeType(_, _) => StorageType::DocumentMetadata,
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
}

impl TryFrom<DocumentKindDiscriminant> for DocumentKind {
    type Error = crate::Error;
    fn try_from(value: DocumentKindDiscriminant) -> Result<Self, Self::Error> {
        let v = match value {
            DocumentKindDiscriminant::FinraComplianceLetter => DocumentKind::FinraComplianceLetter,
            DocumentKindDiscriminant::Passport => DocumentKind::Passport,
            DocumentKindDiscriminant::PassportSelfie => DocumentKind::PassportSelfie,
            DocumentKindDiscriminant::IdCardFront => DocumentKind::IdCardFront,
            DocumentKindDiscriminant::IdCardBack => DocumentKind::IdCardBack,
            DocumentKindDiscriminant::IdCardSelfie => DocumentKind::IdCardSelfie,
            DocumentKindDiscriminant::DriversLicenseFront => DocumentKind::DriversLicenseFront,
            DocumentKindDiscriminant::DriversLicenseBack => DocumentKind::DriversLicenseBack,
            DocumentKindDiscriminant::DriversLicenseSelfie => DocumentKind::DriversLicenseSelfie,
            DocumentKindDiscriminant::PassportNumber => DocumentKind::PassportNumber,
            DocumentKindDiscriminant::PassportExpiration => DocumentKind::PassportExpiration,
            DocumentKindDiscriminant::PassportDob => DocumentKind::PassportDob,
            DocumentKindDiscriminant::DriversLicenseNumber => DocumentKind::DriversLicenseNumber,
            DocumentKindDiscriminant::DriversLicenseExpiration => DocumentKind::DriversLicenseExpiration,
            DocumentKindDiscriminant::DriversLicenseDob => DocumentKind::DriversLicenseDob,
            DocumentKindDiscriminant::DriversLicenseIssuingState => DocumentKind::DriversLicenseIssuingState,
            DocumentKindDiscriminant::IdCardNumber => DocumentKind::IdCardNumber,
            DocumentKindDiscriminant::IdCardExpiration => DocumentKind::IdCardExpiration,
            DocumentKindDiscriminant::MimeType | DocumentKindDiscriminant::LatestUpload => {
                return Err(crate::Error::Custom("Cannot convert".to_owned()))
            }
        };
        Ok(v)
    }
}

// Custom implementations of FromStr and Display since we have some complex variants.
// TODO this is a little messy - it would be nice to have a more structured representation of OCR
// data and images
impl std::str::FromStr for DocumentKind {
    type Err = strum::ParseError;
    fn from_str(s: &str) -> Result<DocumentKind, <Self as std::str::FromStr>::Err> {
        let parts = s.split('.').collect_vec();
        let suffix = parts.last().ok_or(strum::ParseError::VariantNotFound)?;
        let variant = DocumentKindDiscriminant::from_str(suffix);

        let get_parts = || -> Result<(IdDocKind, DocumentSide), _> {
            let prefix = parts.first().ok_or(strum::ParseError::VariantNotFound)?;
            let suffix = parts.get(1).ok_or(strum::ParseError::VariantNotFound)?;
            let prefix = IdDocKind::correct_from_str(prefix)?;
            let suffix = DocumentSide::from_str(suffix)?;
            Ok((prefix, suffix))
        };

        let variant: DocumentKind = match variant {
            Ok(DocumentKindDiscriminant::LatestUpload) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::LatestUpload(prefix, suffix)
            }
            Ok(DocumentKindDiscriminant::MimeType) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::MimeType(prefix, suffix)
            }
            _ => {
                let variant =
                    DocumentKindDiscriminant::from_str(s).map_err(|_| strum::ParseError::VariantNotFound)?;
                Self::try_from(variant).map_err(|_| strum::ParseError::VariantNotFound)?
            }
        };

        Ok(variant)
    }
}

impl std::fmt::Display for DocumentKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        match *self {
            DocumentKind::LatestUpload(id_doc_kind, side) | DocumentKind::MimeType(id_doc_kind, side) => {
                write!(
                    f,
                    "{}.{}.{}",
                    id_doc_kind.correct_fmt(),
                    side,
                    DocumentKindDiscriminant::from(self),
                )
            }
            _ => write!(f, "{}", DocumentKindDiscriminant::from(self)),
        }
    }
}

impl DocumentKind {
    pub fn api_examples() -> Vec<Self> {
        DocumentKindDiscriminant::iter()
            .filter_map(|d| Self::try_from(d).ok())
            .collect()
    }
}
