use crate::AliasId;
use crate::CollectedData;
use crate::DataIdentifier;
use crate::DocumentSide;
use crate::IdDocKind;
use crate::IsDataIdentifierDiscriminant;
use crate::StorageType;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use itertools::Itertools;
use mime::Mime;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::IntoEnumIterator;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumIter;
use strum_macros::EnumString;
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
pub enum DocumentDiKind {
    // TODO We have IdDocKind::Custom but shouldn't be able to use it for any DIs
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

    /// Extracted OCR information from the image
    OcrData(IdDocKind, OcrDataKind),

    /// Letter signed by a compliance officer granting permission to carry an account, required by
    /// FINFRA rules in certain cases
    #[strum_discriminants(strum(to_string = "finra_compliance_letter"))]
    FinraComplianceLetter,
    // .image suffix in case we one day have extracted attributes
    #[strum_discriminants(strum(to_string = "ssn_card.image"))]
    SsnCard,
    #[strum_discriminants(strum(to_string = "proof_of_address.image"))]
    ProofOfAddress,

    /// Custom document
    #[strum_discriminants(strum(to_string = "custom"))]
    Custom(AliasId),
}

crate::util::impl_enum_string_diesel!(DocumentDiKind);

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
    ClaveDeElector,
    /// Incode-determined document type
    ClassifiedDocumentType,
    /// This is the full response from Curp validation
    CurpValidationResponse,
    /// This is the full response from Samba Activity History API
    SambaActivityHistoryResponse,
}

impl OcrDataKind {
    // some data is stored as json
    pub fn is_json(&self) -> bool {
        matches!(
            self,
            Self::CurpValidationResponse | Self::SambaActivityHistoryResponse
        )
    }
}

impl From<DocumentDiKind> for DataIdentifier {
    fn from(value: DocumentDiKind) -> Self {
        Self::Document(value)
    }
}

impl TryFrom<DataIdentifier> for DocumentDiKind {
    type Error = crate::Error;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Document(dk) => Ok(dk),
            _ => Err(crate::Error::Custom("Can't convert into DocumentKind".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for DocumentDiKind {
    fn parent(&self) -> Option<CollectedData> {
        match self {
            DocumentDiKind::Image(_, _) => Some(CollectedData::Document),
            // allow storing this data independently
            DocumentDiKind::Barcodes(_, _)
            | DocumentDiKind::OcrData(_, _)
            | DocumentDiKind::MimeType(_, _)
            | DocumentDiKind::LatestUpload(_, _)
            | DocumentDiKind::Custom(_)
            | DocumentDiKind::ProofOfAddress
            | DocumentDiKind::SsnCard => None,
            DocumentDiKind::FinraComplianceLetter => Some(CollectedData::InvestorProfile),
        }
    }
}

impl DocumentDiKind {
    pub fn accepted_mime_types(&self) -> Vec<Mime> {
        match self {
            DocumentDiKind::Image(_, side) => match side {
                DocumentSide::Front | DocumentSide::Back => {
                    vec![mime::APPLICATION_PDF, mime::IMAGE_JPEG, mime::IMAGE_PNG]
                }
                DocumentSide::Selfie => vec![mime::IMAGE_JPEG, mime::IMAGE_PNG],
            },
            DocumentDiKind::FinraComplianceLetter => vec![mime::APPLICATION_PDF],
            DocumentDiKind::SsnCard | DocumentDiKind::ProofOfAddress => {
                vec![mime::APPLICATION_PDF, mime::IMAGE_JPEG, mime::IMAGE_PNG]
            }
            DocumentDiKind::Barcodes(_, _)
            | DocumentDiKind::OcrData(_, _)
            | DocumentDiKind::MimeType(_, _)
            | DocumentDiKind::LatestUpload(_, _)
            | DocumentDiKind::Custom(_) => {
                vec![]
            }
        }
    }

    pub fn from_id_doc_kind(kind: IdDocKind, side: DocumentSide) -> Self {
        Self::Image(kind, side)
    }
}

impl DocumentDiKind {
    /// defines how the encrypted bytes of the data identifier is stored
    pub fn storage_type(&self) -> StorageType {
        match self {
            DocumentDiKind::Image(_, _)
            | DocumentDiKind::FinraComplianceLetter
            | DocumentDiKind::LatestUpload(_, _)
            | DocumentDiKind::Custom(_)
            | DocumentDiKind::ProofOfAddress
            | DocumentDiKind::SsnCard => StorageType::DocumentData,
            DocumentDiKind::MimeType(_, _) => StorageType::DocumentMetadata,
            DocumentDiKind::OcrData(_, _) | DocumentDiKind::Barcodes(_, _) => StorageType::VaultData,
        }
    }
}

impl DocumentDiKind {
    pub fn searchable() -> Vec<Self> {
        IdDocKind::iter()
            .map(|k| Self::OcrData(k, OcrDataKind::DocumentNumber))
            .collect()
    }
}

// Custom implementations of FromStr and Display since we have some complex variants.
// TODO this is a little messy - it would be nice to have a more structured representation of OCR
// data and images
impl std::str::FromStr for DocumentDiKind {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<DocumentDiKind, <Self as std::str::FromStr>::Err> {
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

        // Custom parsing for simple doc types
        if let Ok(DocumentKindDiscriminant::FinraComplianceLetter) = DocumentKindDiscriminant::from_str(s) {
            return Ok(Self::FinraComplianceLetter);
        }
        if let Ok(DocumentKindDiscriminant::SsnCard) = DocumentKindDiscriminant::from_str(s) {
            tracing::info!(legacy_repr=%false, "Parsed SSN card DI");
            return Ok(Self::SsnCard);
        }
        if let Ok(DocumentKindDiscriminant::ProofOfAddress) = DocumentKindDiscriminant::from_str(s) {
            tracing::info!(legacy_repr=%false, "Parsed PoA DI");
            return Ok(Self::ProofOfAddress);
        }

        // First try parsing govt-isued ID types based on the suffix, like mime_type or latest_upload
        let variant: Option<DocumentDiKind> = match variant {
            Ok(DocumentKindDiscriminant::LatestUpload) => {
                let (prefix, suffix) = get_parts()?;
                Some(DocumentDiKind::LatestUpload(prefix, suffix))
            }
            Ok(DocumentKindDiscriminant::MimeType) => {
                let (prefix, suffix) = get_parts()?;
                Some(DocumentDiKind::MimeType(prefix, suffix))
            }
            Ok(DocumentKindDiscriminant::Image) => {
                let (prefix, suffix) = get_parts()?;
                Some(DocumentDiKind::Image(prefix, suffix))
            }
            Ok(DocumentKindDiscriminant::Barcodes) => {
                let (prefix, suffix) = get_parts()?;
                Some(DocumentDiKind::Barcodes(prefix, suffix))
            }
            _ => None,
        };
        if let Some(variant) = variant {
            return Ok(variant);
        }

        // Ocr data
        let prefix = parts.first().ok_or(strum::ParseError::VariantNotFound)?;
        let suffix = parts.get(1).ok_or(strum::ParseError::VariantNotFound)?;
        if let Ok(prefix) = IdDocKind::from_str(prefix) {
            if let Ok(suffix) = OcrDataKind::from_str(suffix) {
                return Ok(Self::OcrData(prefix, suffix));
            }
        }

        // Custom documents
        if let Ok(DocumentKindDiscriminant::Custom) = DocumentKindDiscriminant::from_str(prefix) {
            let alias = AliasId::from_str(suffix).map_err(|_| strum::ParseError::VariantNotFound)?;
            return Ok(Self::Custom(alias));
        }

        Err(strum::ParseError::VariantNotFound)
    }
}

impl std::fmt::Display for DocumentDiKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        match self {
            DocumentDiKind::LatestUpload(id_doc_kind, side)
            | DocumentDiKind::MimeType(id_doc_kind, side)
            | DocumentDiKind::Image(id_doc_kind, side)
            | DocumentDiKind::Barcodes(id_doc_kind, side) => {
                write!(
                    f,
                    "{}.{}.{}",
                    id_doc_kind,
                    side,
                    DocumentKindDiscriminant::from(self),
                )
            }
            DocumentDiKind::OcrData(doc_kind, data_kind) => {
                write!(f, "{}.{}", doc_kind, data_kind)
            }
            DocumentDiKind::Custom(alias) => {
                write!(f, "custom.{}", alias)
            }
            DocumentDiKind::FinraComplianceLetter
            | DocumentDiKind::ProofOfAddress
            | DocumentDiKind::SsnCard => write!(f, "{}", DocumentKindDiscriminant::from(self)),
        }
    }
}

impl DocumentDiKind {
    /// Enumerate all possible DIs for DocumentKind that we'll display in API docs
    pub fn api_examples() -> Vec<Self> {
        let id_doc_types = IdDocKind::iter().flat_map(|k| {
            // Purposefully omitting LatestUpload here
            let image_types =
                DocumentSide::iter().flat_map(move |s| vec![Self::Image(k, s), Self::MimeType(k, s)]);
            let ocr_types = OcrDataKind::iter().map(move |dk| Self::OcrData(k, dk));
            image_types.chain(ocr_types)
        });
        let simple_types = vec![
            Self::FinraComplianceLetter,
            Self::ProofOfAddress,
            Self::SsnCard,
            Self::Custom(AliasId::fixture()),
        ];
        id_doc_types.chain(simple_types).collect()
    }
}
