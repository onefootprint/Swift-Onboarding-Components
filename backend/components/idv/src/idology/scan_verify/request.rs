use crate::idology::error as IdologyError;
use newtypes::{DocVData, IdDocKind, PiiString};

type QueryId = u64;
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ResultsRequestData {
    /// This is the reference id number we get back from the expectID
    query_id: QueryId,
    output: String,
}
impl From<QueryId> for ResultsRequestData {
    fn from(ref_id: QueryId) -> Self {
        Self {
            query_id: ref_id,
            output: "json".into(),
        }
    }
}
/// Idology request to ScanVerify
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SubmissionRequest {
    pub(crate) username: PiiString,
    pub(crate) password: PiiString,
    #[serde(flatten)]
    pub(crate) data: SubmissionRequestData,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SubmissionRequestData {
    /// This is the reference id number we get back from the expectID
    query_id: u64,
    /// Front image
    image: PiiString,
    // TODO: this says required, but we should (scan) verify
    back_image: PiiString,
    // ISO 3166 Alpha-3 country code.
    country_code: PiiString,
    scan_document_type: ScanDocumentType,
    /// selfie
    /// The faceImage parameter is not required unless you are utilizing the Face Review or Face Compare tools
    face_image: Option<PiiString>,
    /// ipAddress parameter is not required unless you are utilizing ExpectID GeoTrace for your enterprise configuration.
    ip_address: Option<PiiString>,
}

// TODO put this into wire types so front end can use same
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub enum ScanDocumentType {
    DriverLicense,
    IdCard,
    Passport,
}

impl From<IdDocKind> for ScanDocumentType {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::DriversLicense => Self::DriverLicense,
            IdDocKind::IdCard => Self::IdCard,
            IdDocKind::Passport => Self::Passport,
        }
    }
}

// TODO: make this more like socure
// I wonder if we should take an approach more similar to what we do for Socure. So we have a way to expose and check the requirements of the API upfront/earlier, and then by the time we are actually making the vendor request we should only get unexpected failures.
// vs this approach where we only realize we are missing data when we actually attempt a vendor call and then propogate that as an error
impl TryFrom<DocVData> for SubmissionRequestData {
    type Error = IdologyError::ConversionError;
    fn try_from(d: DocVData) -> Result<Self, Self::Error> {
        let DocVData {
            reference_id,
            front_image,
            back_image,
            selfie_image: _,
            country_code,
            document_type,
            first_name: _,
            last_name: _,
        } = d;

        let reference_id = reference_id.ok_or(IdologyError::ConversionError::MissingReferenceId)?;
        let front_image = front_image.ok_or(IdologyError::ConversionError::MissingFrontImage)?;
        let back_image = back_image.ok_or(IdologyError::ConversionError::MissingBackImage)?;
        let country_code = country_code.ok_or(IdologyError::ConversionError::MissingCountry)?;
        if country_code.leak_to_string().len() != 3 {
            return Err(IdologyError::ConversionError::InvalidCountryCode);
        }
        let document_type = document_type.ok_or(IdologyError::ConversionError::MissingDocumentType)?;

        Ok(Self {
            query_id: reference_id,
            country_code,
            image: front_image,
            back_image,
            scan_document_type: document_type.into(),
            // TODO one day
            face_image: None, // For now, we can only have Selfie enabled for Scan Onboard but not Scan Verify
            // TODO
            ip_address: None,
        })
    }
}
