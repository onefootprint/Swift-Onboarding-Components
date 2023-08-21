use crate::{FootprintReasonCode as FRC, IdDocKind};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::Display;
use strum_macros::EnumString;

#[derive(Clone)]
pub struct IncodeRCH {
    // If the test passes, what FRC should we show
    pub ok_code: FRC,
    // If the test fails, what FRC should be produced
    pub fail_code: FRC,
    // TODO: If the test is not present, what FRC should be produced?
    // For example, if incode can't read the barcode, none of the tests for crosschecks are performed
    // but we should still return an FRC
}
impl IncodeRCH {
    pub fn new(ok: FRC, fail: FRC) -> Self {
        Self {
            ok_code: ok,
            fail_code: fail,
        }
    }
}

macro_rules! incode_reason_code_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[ser = $ser:literal] #[footprint_reason_code = $footprint_reason_code:expr] $item:ident),*
        }
    ) => {

        $(#[$macros])*
        pub enum $name {
            $(#[strum(to_string = $ser)] $item,)*
        }


        impl From<&$name> for Option<IncodeRCH> {
            fn from(vendor_reason_code: &$name) -> Self {
                match vendor_reason_code {
                    $($name::$item => $footprint_reason_code),*
                }
            }
        }

    }
}

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
incode_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash)]
    #[serde(try_from = "&str")]
    pub enum IncodeTest {
        // Confirms if the document was tampered with (physical document)
        #[ser = "tamperCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageTampering, FRC::DocumentPossibleImageTampering))]
        TamperCheck,
        // Legacy naming of the Id alteration check
        #[ser = "postitCheckFront"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageTampering, FRC::DocumentPossibleImageTampering))]
        PostitCheckFront,
        #[ser = "postitCheckBack"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageTampering, FRC::DocumentPossibleImageTampering))]
        PostitCheckBack,
        // This is the new postitCheck.
        // Not sure if this is the right FRC, but it's close enough.
        #[ser = "idAlterationCheckFront"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageTampering, FRC::DocumentPossibleImageTampering))]
        IdAlterationCheckFront,
        #[ser = "idAlterationCheckBack"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageTampering, FRC::DocumentPossibleImageTampering))]
        IdAlterationCheckBack,
        // this is the "selfie duplicate" check
        // this is done relative to all of footprint's sessions. If a tenant is having issues with duplicate fraud/malicious actors
        // we should provision them their own environment so the checks are on a smaller surface area and more signalful
        #[ser = "idAlreadyUsedCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentSelfieNotUsedWithDifferentInformation, FRC::DocumentSelfieUsedWithDifferentInformation))]
        IdAlreadyUsedCheck,
        // Alignment:
        // the picture is badly aligned and the correcting algorithm for alignment and cropping could not correct it for processing, and also when cropped captured image of ID  is near the edges.
        #[ser = "alignment"]
        #[footprint_reason_code = None]
        Alignment,
        // Technology to identify and reject fake IDs (Credentials not issued by government authority).
        // ML model that can detect patterns that differs from the original ones. For example: slight difference in layout of the ID, different font or font size.
        #[ser = "fakeCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNotFakeImage, FRC::DocumentPossibleFakeImage))]
        FakeCheck,
        #[ser = "ocrIdentityCheck"]
        #[footprint_reason_code = None]
        OcrIdentityCheck,
        // Confirms if the document was captured from a screen meaning that the plastic document was not used.
        #[ser = "screenIdLiveness"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentPhotoIsNotScreenCapture, FRC::DocumentPhotoIsScreenCapture))]
        ScreenIdLiveness,
        // Confirms if the document was captured from a printed paper meaning that the plastic document was not used.
        #[ser = "paperIdLiveness"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentPhotoIsNotPaperCapture, FRC::DocumentPhotoIsPaperCapture))]
        PaperIdLiveness,
        #[ser = "readabilityCheck"]
        #[footprint_reason_code = None]
        ReadabilityCheck,
        // Proper lighting on front
        #[ser = "balancedLightFront"]
        #[footprint_reason_code = None]
        BalancedLightFront,
        // Proper lighting on back
        #[ser = "balancedLightBack"]
        #[footprint_reason_code = None]
        BalancedLightBack,
        // Proper sharpness on front
        #[ser = "sharpnessFront"]
        #[footprint_reason_code = None]
        SharpnessFront,
        // Proper sharpness on back
        #[ser = "sharpnessBack"]
        #[footprint_reason_code = None]
        SharpnessBack,
        #[ser = "documentClassification"]
        #[footprint_reason_code = None]
        DocumentClassification,
        // Verifies visible photo features
        #[ser = "visiblePhotoFeatures"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentVisiblePhotoFeaturesVerified, FRC::DocumentVisiblePhotoFeaturesNotVerified))]
        VisiblePhotoFeatures,
        // Confirms the issue_date is valid
        #[ser = "issueDateValidity"]
        #[footprint_reason_code = None]
        IssueDateValidity,
        // Confirms the document is not expired
        #[ser = "documentExpired"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNotExpired, FRC::DocumentExpired))]
        DocumentExpired,
        #[ser = "documentSeriesExpired"]
        #[footprint_reason_code = None]
        DocumentSeriesExpired,
        // Check DOB is valid date
        #[ser = "birthDateValidity"]
        #[footprint_reason_code = None]
        BirthDateValidity,
        // Check expiration data is valid
        #[ser = "expirationDateValidity"]
        #[footprint_reason_code = None]
        ExpirationDateValidity,
        #[ser = "issuingStateValidity"]
        #[footprint_reason_code = None]
        IssuingStateValidity,
        #[ser = "qrScan"]
        #[footprint_reason_code = None]
        QrScan,
        // TODO: Not sure what check digits are
        #[ser = "documentNumberCheckDigit"]
        #[footprint_reason_code = None]
        DocumentNumberCheckDigit,
        #[ser = "birthDateCheckDigit"]
        #[footprint_reason_code = None]
        BirthDateCheckDigit,
        #[ser = "expirationDateCheckDigit"]
        #[footprint_reason_code = None]
        ExpirationDateCheckDigit,
        #[ser = "compositeCheckDigit"]
        #[footprint_reason_code = None]
        CompositeCheckDigit,
        #[ser = "iliterationCheck"]
        #[footprint_reason_code = None]
        IliterationCheck,
        // TODO
        // Match DOB with MRZ
        #[ser = "birthDateCrosscheck"]
        #[footprint_reason_code = None]
        BirthDateCrosscheck,
        // TODO
        // Match expiration with MRZ
        #[ser = "expirationDateCrosscheck"]
        #[footprint_reason_code = None]
        ExpirationDateCrosscheck,
        // TODO
        // Match sex with MRZ
        #[ser = "sexCrosscheck"]
        #[footprint_reason_code = None]
        SexCrosscheck,
        // TODO
        // Match full name with MRZ
        #[ser = "fullNameCrosscheck"]
        #[footprint_reason_code = None]
        FullNameCrosscheck,
        // ?
        #[ser = "emissionNumberCrosscheck"]
        #[footprint_reason_code = None]
        EmissionNumberCrosscheck,
        // TODO
        // Match document number with MRZ
        #[ser = "documentNumberCrosscheck"]
        #[footprint_reason_code = None]
        DocumentNumberCrosscheck,
        // TODO
        // Match personal number with MRZ
        #[ser = "personalNumberCrosscheck"]
        #[footprint_reason_code = None]
        PersonalNumberCrosscheck,
        // Barcode is converted to text and then compared against OCR and front ID.  Information extracted from a barcode may include: name, address, DOB, eye color, SSN, etc.
        #[ser = "2DBarcodeContent"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentBarcodeContentMatches, FRC::DocumentBarcodeContentDoesNotMatch))]
        TwoDBarcodeContent,
        // Barcode was detected on the back of the document
        #[ser = "barcode2DDetected"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentBarcodeCouldBeRead, FRC::DocumentBarcodeCouldNotBeRead))]
        Barcode2DDetected,
        // TODO
        // Check front/back id of document (if somebody put for example both front ID side during upload)
        #[ser = "documentTypeSideCrosscheck"]
        #[footprint_reason_code = None]
        DocumentTypeSideCrosscheck,
        // TODO
        #[ser = "dD/ReferenceNumberCrosscheck"]
        #[footprint_reason_code = None]
        DDReferenceNumberCrosscheck,
        // I think just based on settings
        #[ser = "underageCheck"]
        #[footprint_reason_code = None]
        UnderageCheck,
        // Only present if we send FN/LN in customFields during the onboardingStart call
        // they just check direct ==, no fuzzy/fancy logic
        #[ser = "firstNameMatch"]
        #[footprint_reason_code = None]
        FirstNameMatch,
        #[ser = "lastNameMatch"]
        #[footprint_reason_code = None]
        LastNameMatch
    }
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
            IncodeDocumentType::DriversLicense => Ok(Self::DriversLicense),
            IncodeDocumentType::IdentificationCard => Ok(Self::IdCard),
            IncodeDocumentType::Permit => Ok(Self::Permit),
            IncodeDocumentType::Visa => Ok(Self::Visa),
            IncodeDocumentType::ResidenceDocument => Ok(Self::ResidenceDocument),
            _ => Err(crate::Error::Custom(format!(
                "Incode document type {} not supported",
                value
            ))),
        }
    }
}
