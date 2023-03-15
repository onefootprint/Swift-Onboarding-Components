use newtypes::PiiString;

use crate::idology::{expectid, scan_onboarding, scan_verify};

/// Request to Idology ExpectID
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Request {
    pub(crate) username: PiiString,
    pub(crate) password: PiiString,
    pub(crate) output: String,
    #[serde(flatten)]
    pub(crate) data: IdologyRequestData,
}

impl Request {
    pub fn new(username: PiiString, password: PiiString, data: IdologyRequestData) -> Self {
        Self {
            username,
            password,
            output: "json".to_owned(),
            data,
        }
    }
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug, Clone, serde::Serialize)]
#[serde(untagged)]
pub(crate) enum IdologyRequestData {
    ExpectId(expectid::request::RequestData),
    ScanOnboarding(scan_onboarding::request::SubmissionRequestData),
    ScanVerify(scan_verify::request::SubmissionRequestData),
    ScanVerifyResults(scan_verify::request::ResultsRequestData),
}
