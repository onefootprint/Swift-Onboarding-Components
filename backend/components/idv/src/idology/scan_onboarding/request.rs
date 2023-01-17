use crate::idology::error as IdologyError;
use newtypes::{DocVData, PiiString};

use crate::idology::scan_verify::request::ScanDocumentType;

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
    output: String,
}

impl TryFrom<DocVData> for SubmissionRequestData {
    type Error = IdologyError::ConversionError;
    fn try_from(d: DocVData) -> Result<Self, Self::Error> {
        let DocVData {
            reference_id: _,
            front_image,
            back_image,
            selfie_image,
            country_code,
            document_type,
        } = d;

        let front_image = front_image.ok_or(IdologyError::ConversionError::MissingFrontImage)?;
        let back_image = back_image.ok_or(IdologyError::ConversionError::MissingBackImage)?;
        let country_code = country_code.ok_or(IdologyError::ConversionError::MissingCountry)?;
        if country_code.leak_to_string().len() != 3 {
            return Err(IdologyError::ConversionError::InvalidCountryCode);
        }
        let document_type = document_type.ok_or(IdologyError::ConversionError::MissingDocumentType)?;

        Ok(Self {
            country_code,
            image: front_image,
            back_image,
            scan_document_type: document_type.into(),
            // TODO one day
            face_image: selfie_image,
            // TODO
            ip_address: None,
            output: String::from("json"),
        })
    }
}
