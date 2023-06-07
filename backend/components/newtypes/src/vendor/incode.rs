use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::Display;
use strum_macros::EnumString;

use crate::IdDocKind;

#[derive(Display, Debug, EnumString, Eq, PartialEq)]
pub enum IncodeStatus {
    #[strum(serialize = "OK")]
    Ok,
    #[strum(serialize = "WARN")]
    Warn,
    #[strum(serialize = "FAIL")]
    Fail,
    #[strum(serialize = "UNKNOWN")]
    Unknown,
}

#[derive(Display, Debug, EnumString, Eq, PartialEq, Hash)]
pub enum IncodeTest {
    #[strum(serialize = "tamperCheck")]
    TamperCheck,
    #[strum(serialize = "postitCheck")]
    PostitCheck,
    #[strum(serialize = "alignment")]
    Alignment,
    #[strum(serialize = "fakeCheck")]
    FakeCheck,
    #[strum(serialize = "ocrIdentityCheck")]
    OcrIdentityCheck,
    #[strum(serialize = "screenIdLiveness")]
    ScreenIdLiveness,
    #[strum(serialize = "paperIdLiveness")]
    PaperIdLiveness,
    #[strum(serialize = "readabilityCheck")]
    ReadabilityCheck,
    #[strum(serialize = "balancedLightFront")]
    BalancedLightFront,
    #[strum(serialize = "balancedLightBack")]
    BalancedLightBack,
    #[strum(serialize = "sharpnessFront")]
    SharpnessFront,
    #[strum(serialize = "sharpnessBack")]
    SharpnessBack,
    #[strum(serialize = "documentClassification")]
    DocumentClassification,
    #[strum(serialize = "visiblePhotoFeatures")]
    VisiblePhotoFeatures,
    #[strum(serialize = "issueDateValidity")]
    IssueDateValidity,
    #[strum(serialize = "documentExpired")]
    DocumentExpired,
    #[strum(serialize = "documentSeriesExpired")]
    DocumentSeriesExpired,
    #[strum(serialize = "birthDateValidity")]
    BirthDateValidity,
    #[strum(serialize = "expirationDateValidity")]
    ExpirationDateValidity,
    #[strum(serialize = "issuingStateValidity")]
    IssuingStateValidity,
    #[strum(serialize = "qrScan")]
    QrScan,
    #[strum(serialize = "documentNumberCheckDigit")]
    DocumentNumberCheckDigit,
    #[strum(serialize = "birthDateCheckDigit")]
    BirthDateCheckDigit,
    #[strum(serialize = "expirationDateCheckDigit")]
    ExpirationDateCheckDigit,
    #[strum(serialize = "compositeCheckDigit")]
    CompositeCheckDigit,
    #[strum(serialize = "iliterationCheck")]
    IliterationCheck,
    #[strum(serialize = "birthDateCrosscheck")]
    BirthDateCrosscheck,
    #[strum(serialize = "expirationDateCrosscheck")]
    ExpirationDateCrosscheck,
    #[strum(serialize = "sexCrosscheck")]
    SexCrosscheck,
    #[strum(serialize = "fullNameCrosscheck")]
    FullNameCrosscheck,
    #[strum(serialize = "emissionNumberCrosscheck")]
    EmissionNumberCrosscheck,
    #[strum(serialize = "documentNumberCrosscheck")]
    DocumentNumberCrosscheck,
    #[strum(serialize = "personalNumberCrosscheck")]
    PersonalNumberCrosscheck,
    #[strum(serialize = "2DBarcodeContent")]
    TwoDBarcodeContent,
    #[strum(serialize = "barcode2DDetected")]
    Barcode2DDetected,
    #[strum(serialize = "documentTypeSideCrosscheck")]
    DocumentTypeSideCrosscheck,
    #[strum(serialize = "dD/ReferenceNumberCrosscheck")]
    DDReferenceNumberCrosscheck,
    #[strum(serialize = "underageCheck")]
    UnderageCheck,
    #[strum(serialize = "firstNameMatch")]
    FirstNameMatch,
    #[strum(serialize = "lastNameMatch")]
    LastNameMatch,
}

#[derive(Display, Debug, Clone, EnumString, Eq, PartialEq, Hash, DeserializeFromStr, SerializeDisplay)]
pub enum IncodeDocumentType {
    #[strum(serialize = "Unknown")]
    Unknown,
    #[strum(serialize = "Passport")]
    Passport,
    #[strum(serialize = "Visa")]
    Visa,
    #[strum(serialize = "DriversLicense")]
    DriversLicense,
    #[strum(serialize = "IdentificationCard")]
    IdentificationCard,
    #[strum(serialize = "Permit")]
    Permit,
    #[strum(serialize = "Currency")]
    Currency,
    #[strum(serialize = "ResidenceDocument")]
    ResidenceDocument,
    #[strum(serialize = "TravelDocument")]
    TravelDocument,
    #[strum(serialize = "BirthCertificate")]
    BirthCertificate,
    #[strum(serialize = "VehicleRegistration")]
    VehicleRegistration,
    #[strum(serialize = "Other")]
    Other,
    #[strum(serialize = "WeaponLicense")]
    WeaponLicense,
    #[strum(serialize = "TribalIdentification")]
    TribalIdentification,
    #[strum(serialize = "VoterIdentification")]
    VoterIdentification,
    #[strum(serialize = "Military")]
    Military,
    #[strum(serialize = "TaxIdentification")]
    TaxIdentification,
    #[strum(serialize = "FederalID")]
    FederalID,
    #[strum(serialize = "MedicalCard")]
    MedicalCard,
    NonParsableDocType(String),
}

impl<'a> TryFrom<&'a IncodeDocumentType> for IdDocKind {
    type Error = crate::Error;
    fn try_from(value: &'a IncodeDocumentType) -> Result<Self, Self::Error> {
        match value {
            IncodeDocumentType::Passport => Ok(Self::Passport),
            IncodeDocumentType::DriversLicense => Ok(Self::DriverLicense),
            IncodeDocumentType::IdentificationCard => Ok(Self::IdCard),
            _ => Err(crate::Error::Custom(format!(
                "Incode document type {} not supported",
                value
            ))),
        }
    }
}
