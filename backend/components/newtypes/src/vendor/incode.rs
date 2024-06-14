use crate::{
    FootprintReasonCode as FRC,
    IdDocKind,
};
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum::Display;
use strum_macros::{
    EnumIter,
    EnumString,
};

#[derive(Clone)]
pub struct IncodeRCH {
    // If the test passes, what FRC should we show
    pub ok_code: Option<FRC>,
    // If the test fails, what FRC should be produced
    pub fail_code: Option<FRC>,
    // TODO: If the test is not present, what FRC should be produced?
    // For example, if incode can't read the barcode, none of the tests for crosschecks are performed
    // but we should still return an FRC
}
impl IncodeRCH {
    pub fn new(ok: FRC, fail: FRC) -> Self {
        Self {
            ok_code: Some(ok),
            fail_code: Some(fail),
        }
    }

    pub fn new_with_optional(ok: Option<FRC>, fail: Option<FRC>) -> Self {
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
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageAlterationFront, FRC::DocumentPossibleImageAlterationFront))]
        PostitCheckFront,
        #[ser = "postitCheckBack"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageAlterationBack, FRC::DocumentPossibleImageAlterationBack))]
        PostitCheckBack,
        // This is the new postitCheck.
        // Not sure if this is the right FRC, but it's close enough.
        #[ser = "idAlterationCheckFront"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageAlterationFront, FRC::DocumentPossibleImageAlterationFront))]
        IdAlterationCheckFront,
        #[ser = "idAlterationCheckBack"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNoImageAlterationBack, FRC::DocumentPossibleImageAlterationBack))]
        IdAlterationCheckBack,
        #[ser = "idAlterationCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentPossibleImageAlteration)))]
        IdAlterationCheck,
        // this is the "selfie duplicate" check
        // this is done relative to all of footprint's sessions. If a tenant is having issues with duplicate fraud/malicious actors
        // we should provision them their own environment so the checks are on a smaller surface area and more signalful
        #[ser = "idAlreadyUsedCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentSelfieUsedWithDifferentInformation)))]
        IdAlreadyUsedCheck,
        // Alignment:
        // the picture is badly aligned and the correcting algorithm for alignment and cropping could not correct it for processing, and also when cropped captured image of ID  is near the edges.
        #[ser = "alignment"]
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentAlignmentFailed)))]
        Alignment,
        // Technology to identify and reject fake IDs (Credentials not issued by government authority).
        // ML model that can detect patterns that differs from the original ones. For example: slight difference in layout of the ID, different font or font size.
        //
        // 2024-04-15: this appears as fakeCheck in the API response, but the display has been changed on Incode's side to be more specifically about pdf417 data
        #[ser = "fakeCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentPdf417DataIsValid, FRC::DocumentPdf417DataIsNotValid))]
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
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentCouldNotClassify)))]
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
        // We turned off expiration check so it wouldn't impact the doc score and we manually compute this reason code ourselves
        #[footprint_reason_code = None]
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
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentQrCodeCheck)))]
        QrScan,
        #[ser = "mrzLineFormatCheck"]
        #[footprint_reason_code = Some(IncodeRCH::new_with_optional(None, Some(FRC::DocumentMrzLineFormatCheck)))]
        MrzLineFormatCheck,
        // TODO: Not sure what check digits are
        #[ser = "documentNumberCheckDigit"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNumberCheckDigitMatches, FRC::DocumentNumberCheckDigitDoesNotMatch))]
        DocumentNumberCheckDigit,
        #[ser = "birthDateCheckDigit"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentDobCheckDigitMatches, FRC::DocumentDobCheckDigitDoesNotMatch))]
        BirthDateCheckDigit,
        #[ser = "expirationDateCheckDigit"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentExpirationCheckDigitMatches, FRC::DocumentExpirationCheckDigitDoesNotMatch))]
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
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentDobCrosscheckMatches, FRC::DocumentDobCrosscheckDoesNotMatch))]
        BirthDateCrosscheck,
        // TODO
        // Match expiration with MRZ
        #[ser = "expirationDateCrosscheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentExpirationDateCrosscheckMatches, FRC::DocumentExpirationDateCrosscheckDoesNotMatch))]
        ExpirationDateCrosscheck,
        // TODO
        // Match sex with MRZ
        #[ser = "sexCrosscheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentSexCrosscheckMatches, FRC::DocumentSexCrosscheckDoesNotMatch))]
        SexCrosscheck,
        // TODO
        // Match full name with MRZ
        #[ser = "fullNameCrosscheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentFullNameCrosscheckMatches, FRC::DocumentFullNameCrosscheckDoesNotMatch))]
        FullNameCrosscheck,
        // ?
        #[ser = "emissionNumberCrosscheck"]
        #[footprint_reason_code = None]
        EmissionNumberCrosscheck,
        // TODO
        // Match document number with MRZ
        #[ser = "documentNumberCrosscheck"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentNumberCrosscheckMatches, FRC::DocumentNumberCrosscheckDoesNotMatch))]
        DocumentNumberCrosscheck,
        // TODO
        // Match personal number with MRZ
        #[ser = "personalNumberCrosscheck"]
        #[footprint_reason_code = None]
        PersonalNumberCrosscheck,
        // Barcode was able to be converted to text
        #[ser = "2DBarcodeContent"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentBarcodeCouldBeRead, FRC::DocumentBarcodeCouldNotBeRead))]
        TwoDBarcodeContent,
        // Barcode was detected on the back of the document
        #[ser = "barcode2DDetected"]
        #[footprint_reason_code = Some(IncodeRCH::new(FRC::DocumentBarcodeDetected, FRC::DocumentBarcodeCouldNotBeDetected))]
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

impl IncodeTest {
    pub fn is_crosscheck(&self) -> bool {
        match self {
            IncodeTest::TamperCheck
            | IncodeTest::PostitCheckFront
            | IncodeTest::PostitCheckBack
            | IncodeTest::IdAlterationCheckFront
            | IncodeTest::IdAlterationCheckBack
            | IncodeTest::IdAlreadyUsedCheck
            | IncodeTest::Alignment
            | IncodeTest::FakeCheck
            | IncodeTest::OcrIdentityCheck
            | IncodeTest::ScreenIdLiveness
            | IncodeTest::PaperIdLiveness
            | IncodeTest::ReadabilityCheck
            | IncodeTest::BalancedLightFront
            | IncodeTest::BalancedLightBack
            | IncodeTest::SharpnessFront
            | IncodeTest::SharpnessBack
            | IncodeTest::DocumentClassification
            | IncodeTest::VisiblePhotoFeatures
            | IncodeTest::IssueDateValidity
            | IncodeTest::DocumentExpired
            | IncodeTest::DocumentSeriesExpired
            | IncodeTest::BirthDateValidity
            | IncodeTest::ExpirationDateValidity
            | IncodeTest::IssuingStateValidity
            | IncodeTest::QrScan
            | IncodeTest::UnderageCheck
            | IncodeTest::IliterationCheck
            | IncodeTest::FirstNameMatch
            | IncodeTest::DocumentNumberCheckDigit
            | IncodeTest::BirthDateCheckDigit
            | IncodeTest::ExpirationDateCheckDigit
            | IncodeTest::CompositeCheckDigit
            | IncodeTest::TwoDBarcodeContent
            | IncodeTest::Barcode2DDetected
            | IncodeTest::MrzLineFormatCheck
            | IncodeTest::IdAlterationCheck
            | IncodeTest::LastNameMatch => false,

            // Tests relating to checking MRZ/Barcode against OCR
            IncodeTest::BirthDateCrosscheck
            | IncodeTest::ExpirationDateCrosscheck
            | IncodeTest::SexCrosscheck
            | IncodeTest::FullNameCrosscheck
            | IncodeTest::EmissionNumberCrosscheck
            | IncodeTest::DocumentNumberCrosscheck
            | IncodeTest::PersonalNumberCrosscheck
            | IncodeTest::DocumentTypeSideCrosscheck
            | IncodeTest::DDReferenceNumberCrosscheck => true,
        }
    }
}

#[derive(
    Display, Debug, Clone, EnumString, Eq, PartialEq, Hash, DeserializeFromStr, SerializeDisplay, EnumIter,
)]
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

impl<'a> TryFrom<(&'a IncodeDocumentType, Option<&'a IncodeDocumentSubType>)> for IdDocKind {
    type Error = crate::Error;

    fn try_from(
        (doc_type, doc_sub_type): (&'a IncodeDocumentType, Option<&'a IncodeDocumentSubType>),
    ) -> Result<Self, Self::Error> {
        match (doc_type, doc_sub_type) {
            (IncodeDocumentType::Passport, _) => Ok(Self::Passport),
            (IncodeDocumentType::TravelDocument, Some(IncodeDocumentSubType::PassportCardAllages)) => {
                Ok(Self::PassportCard)
            }
            (IncodeDocumentType::DriversLicense, _) => Ok(Self::DriversLicense),
            (IncodeDocumentType::IdentificationCard, _) => Ok(Self::IdCard),
            (IncodeDocumentType::Permit, _) => Ok(Self::Permit),
            (IncodeDocumentType::Visa, _) => Ok(Self::Visa),
            (IncodeDocumentType::ResidenceDocument, _) => Ok(Self::ResidenceDocument),
            (IncodeDocumentType::VoterIdentification, _) => Ok(Self::VoterIdentification),
            _ => Err(crate::Error::Custom(format!(
                "Incode document type {} not supported",
                doc_type
            ))),
        }
    }
}

impl From<IdDocKind> for (Option<IncodeDocumentType>, Option<IncodeDocumentSubType>) {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::IdCard => (
                Some(IncodeDocumentType::IdentificationCard),
                Some(IncodeDocumentSubType::IdentificationCard),
            ),
            IdDocKind::DriversLicense => (
                Some(IncodeDocumentType::DriversLicense),
                Some(IncodeDocumentSubType::DriversLicense),
            ),
            IdDocKind::Passport => (Some(IncodeDocumentType::Passport), None),
            IdDocKind::PassportCard => (
                Some(IncodeDocumentType::TravelDocument),
                Some(IncodeDocumentSubType::PassportCardAllages),
            ),
            IdDocKind::Permit => (Some(IncodeDocumentType::Permit), None),
            IdDocKind::Visa => (Some(IncodeDocumentType::Visa), None),
            IdDocKind::ResidenceDocument => (Some(IncodeDocumentType::ResidenceDocument), None),
            IdDocKind::VoterIdentification => (Some(IncodeDocumentType::VoterIdentification), None),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum IncodeDocumentRestriction {
    NoDriverLicensePermit,
    ConservativeGlare,
    ConservativeSharpness,
}

#[derive(
    Display, Debug, Clone, EnumString, Eq, PartialEq, Hash, DeserializeFromStr, SerializeDisplay, EnumIter,
)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum IncodeDocumentSubType {
    CedulaDeIdentificacionFiscal,
    ConsularCard,
    ConsularIdentificationCard,
    DriverLicense,
    DriverLicenseUnder21,
    DriversLicense,
    DriversLicenseUnder21,
    EmploymentAuthorizationCard,
    EnhancedDriverLicense,
    EnhancedDriversLicense,
    EnhancedDriversLicenseUnder21,
    EnhancedIdentificationCard,
    EnhancedIdentificationCardUnder21,
    EnhancedLearnersPermitUnder21,
    EnhancedProvisionalDriversLicenseUnder21,
    GlobalEntry,
    GovernmentIdentificationCard,
    IdentificationCard,
    IdentificationCardAllages,
    IdentificationCardUnder21,
    IntermediateDriversLicenseUnder21,
    InternationalDrivingPermit,
    JuniorDriversLicense,
    JuniorOperatorsLicenseUnder21,
    LearnersPermit,
    LearnersPermitUnder21,
    MatriculaConsular,
    MedicalCard,
    NationalIdentificationCard,
    NationalPassport,
    PassportCardAllages,
    PermanentResidenceCard,
    PermanentResidentCardAllages,
    ProvisionalDriversLicense,
    ProvisionalDriversLicenseUnder21,
    ResidencePermit,
    SocialSecurityCard,
    TemporaryDriversLicense,
    TemporaryResidenceCard,
    TribalIdentificationCard,
    UmidCard,
    VeteranIdentificationCard,
    VisaAllages,
    VisaB1B2,
    VoterIdentificationCard,
}

#[cfg(test)]
mod tests {
    use super::{
        IncodeDocumentSubType,
        IncodeDocumentType,
    };
    use crate::IdDocKind;
    use std::str::FromStr;
    use strum::IntoEnumIterator;

    #[test]
    fn test_we_added_incode_kind_to_id_doc_kind_mapping() {
        let mut incode_doc_types_mapped_to_our_doc_types: Vec<IdDocKind> = IncodeDocumentType::iter()
            .filter_map(|dt| IdDocKind::try_from((&dt, None)).ok())
            .collect();
        incode_doc_types_mapped_to_our_doc_types.push(
            IdDocKind::try_from((
                &IncodeDocumentType::TravelDocument,
                Some(&IncodeDocumentSubType::PassportCardAllages),
            ))
            .unwrap(),
        );
        IdDocKind::iter().for_each(|doc_kind| {
            assert!(
                incode_doc_types_mapped_to_our_doc_types.contains(&doc_kind),
                "{}",
                format!(
                    "Make sure you add {} to TryFrom<&'a IncodeDocumentType> for IdDocKind",
                    doc_kind
                )
            )
        })
    }

    #[test]
    fn scream_like_a_snake() {
        assert_eq!(
            IncodeDocumentSubType::EnhancedDriversLicenseUnder21,
            IncodeDocumentSubType::from_str("ENHANCED_DRIVERS_LICENSE_UNDER21").unwrap()
        );
    }
}
