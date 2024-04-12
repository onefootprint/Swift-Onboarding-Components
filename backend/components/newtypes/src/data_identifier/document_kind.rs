use crate::{
    CollectedData, DataIdentifier, DocumentSide, IdDocKind, IsDataIdentifierDiscriminant, StorageType,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use mime::Mime;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, Display, EnumDiscriminants, EnumIter, EnumString};
/// test2
#[derive(
    Debug,
    Clone,
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
    /// represents the verified image for a document
    /// document.[doc_kind].[side].image
    #[strum_discriminants(strum(to_string = "image"))]
    Image(IdDocKind, DocumentSide),
    /// represents the mime type of a document
    /// document.[doc_kind].[side].mime_type
    #[strum_discriminants(strum(to_string = "mime_type"))]
    MimeType(IdDocKind, DocumentSide),

    /// represents the latest upload of a document
    /// document.[doc_kind].[side].latest_upload - TODO one day latest_upload_mime_type?
    #[strum_discriminants(strum(to_string = "latest_upload"))]
    LatestUpload(IdDocKind, DocumentSide),

    /// represents barcodes capture on this side of the document
    /// document.[doc_kind].[side].barcodes
    #[strum_discriminants(strum(to_string = "barcodes"))]
    Barcodes(IdDocKind, DocumentSide),

    /// Letter signed by a compliance officer granting permission to carry an account, required by FINFRA rules in certain cases
    #[strum_discriminants(strum(to_string = "finra_compliance_letter"))]
    FinraComplianceLetter,

    /// Extracted OCR information from the image
    OcrData(IdDocKind, OcrDataKind),
}

crate::util::impl_enum_string_diesel!(DocumentKind);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, EnumString, AsRefStr, Display, EnumIter)]
#[strum(serialize_all = "snake_case")]
pub enum OcrDataKind {
    FullName,
    Dob,
    Gender,
    FullAddress,
    DocumentNumber,
    ExpiresAt,
    IssuedAt,
    IssuingState,
    IssuingCountry,
    RefNumber,
    Nationality,
    Curp,
    /// Incode-determined document type
    ClassifiedDocumentType,
    /// This is the full response from Curp validation
    CurpValidationResponse,
}

impl OcrDataKind {
    // some data is stored as json
    pub fn is_json(&self) -> bool {
        matches!(self, Self::CurpValidationResponse)
    }
}

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

impl IsDataIdentifierDiscriminant for DocumentKind {
    fn parent(&self) -> Option<CollectedData> {
        match self {
            DocumentKind::Image(_, _) => Some(CollectedData::Document),
            // allow storing this data independently
            DocumentKind::Barcodes(_, _)
            | DocumentKind::OcrData(_, _)
            | DocumentKind::MimeType(_, _)
            | DocumentKind::LatestUpload(_, _) => None,
            DocumentKind::FinraComplianceLetter => Some(CollectedData::InvestorProfile),
        }
    }
}

impl DocumentKind {
    pub fn accepted_mime_types(&self) -> Vec<Mime> {
        match self {
            DocumentKind::Image(_, side) => match side {
                DocumentSide::Front | DocumentSide::Back => {
                    vec![mime::APPLICATION_PDF, mime::IMAGE_JPEG, mime::IMAGE_PNG]
                }
                DocumentSide::Selfie => vec![mime::IMAGE_JPEG, mime::IMAGE_PNG],
            },
            DocumentKind::FinraComplianceLetter => vec![mime::APPLICATION_PDF],
            DocumentKind::Barcodes(_, _)
            | DocumentKind::OcrData(_, _)
            | DocumentKind::MimeType(_, _)
            | DocumentKind::LatestUpload(_, _) => {
                vec![]
            }
        }
    }

    pub fn from_id_doc_kind(kind: IdDocKind, side: DocumentSide) -> Self {
        Self::Image(kind, side)
    }
}

impl DocumentKind {
    /// defines how the encrypted bytes of the data identifier is stored
    pub fn storage_type(&self) -> StorageType {
        match self {
            DocumentKind::Image(_, _)
            | DocumentKind::FinraComplianceLetter
            | DocumentKind::LatestUpload(_, _) => StorageType::DocumentData,
            DocumentKind::MimeType(_, _) => StorageType::DocumentMetadata,
            DocumentKind::OcrData(_, _) | DocumentKind::Barcodes(_, _) => StorageType::VaultData,
        }
    }
}

impl DocumentKind {
    pub fn searchable() -> Vec<Self> {
        IdDocKind::iter()
            .map(|k| Self::OcrData(k, OcrDataKind::DocumentNumber))
            .collect()
    }
}

impl TryFrom<DocumentKindDiscriminant> for DocumentKind {
    type Error = strum::ParseError;

    fn try_from(value: DocumentKindDiscriminant) -> Result<Self, Self::Error> {
        let v = match value {
            DocumentKindDiscriminant::FinraComplianceLetter => DocumentKind::FinraComplianceLetter,
            DocumentKindDiscriminant::Barcodes
            | DocumentKindDiscriminant::OcrData
            | DocumentKindDiscriminant::Image
            | DocumentKindDiscriminant::MimeType
            | DocumentKindDiscriminant::LatestUpload => return Err(strum::ParseError::VariantNotFound),
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
            let prefix = IdDocKind::from_str(prefix)?;
            let suffix = DocumentSide::from_str(suffix)?;
            Ok((prefix, suffix))
        };

        let variant: DocumentKind = match variant {
            // First try parsing based on the suffix, like mime_type or latest_upload
            Ok(DocumentKindDiscriminant::LatestUpload) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::LatestUpload(prefix, suffix)
            }
            Ok(DocumentKindDiscriminant::MimeType) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::MimeType(prefix, suffix)
            }
            Ok(DocumentKindDiscriminant::Image) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::Image(prefix, suffix)
            }
            Ok(DocumentKindDiscriminant::Barcodes) => {
                let (prefix, suffix) = get_parts()?;
                DocumentKind::Barcodes(prefix, suffix)
            }
            // Otherwise, try parsing as other variants
            _ => {
                if let Ok(variant) = DocumentKindDiscriminant::from_str(s)
                    .map_err(|_| strum::ParseError::VariantNotFound)
                    .and_then(Self::try_from)
                {
                    // TODO should we just remove discriminant code?
                    variant
                } else {
                    let prefix = parts.first().ok_or(strum::ParseError::VariantNotFound)?;
                    let suffix = parts.get(1).ok_or(strum::ParseError::VariantNotFound)?;
                    let prefix = IdDocKind::from_str(prefix)?;
                    let suffix = OcrDataKind::from_str(suffix)?;
                    Self::OcrData(prefix, suffix)
                }
            }
        };

        Ok(variant)
    }
}

impl std::fmt::Display for DocumentKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        match *self {
            DocumentKind::LatestUpload(id_doc_kind, side)
            | DocumentKind::MimeType(id_doc_kind, side)
            | DocumentKind::Image(id_doc_kind, side)
            | DocumentKind::Barcodes(id_doc_kind, side) => {
                write!(
                    f,
                    "{}.{}.{}",
                    id_doc_kind,
                    side,
                    DocumentKindDiscriminant::from(self),
                )
            }
            DocumentKind::OcrData(doc_kind, data_kind) => {
                write!(f, "{}.{}", doc_kind, data_kind)
            }
            DocumentKind::FinraComplianceLetter => write!(f, "{}", DocumentKindDiscriminant::from(self)),
        }
    }
}

impl DocumentKind {
    /// Enumerate all possible DIs for DocumentKind that we'll display in API docs
    pub fn api_examples() -> Vec<Self> {
        let complex_types = IdDocKind::iter().flat_map(|k| {
            // Purposefully omitting LatestUpload here
            let image_types =
                DocumentSide::iter().flat_map(move |s| vec![Self::Image(k, s), Self::MimeType(k, s)]);
            let ocr_types = OcrDataKind::iter().map(move |dk| Self::OcrData(k, dk));
            image_types.chain(ocr_types)
        });
        let simple_types = DocumentKindDiscriminant::iter().filter_map(|d| Self::try_from(d).ok());
        complex_types.chain(simple_types).collect()
    }
}
