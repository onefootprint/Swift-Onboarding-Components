use crate::idology::expectid::request::RequestData;
use newtypes::PiiString;

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

#[allow(clippy::large_enum_variant)]
#[derive(Debug, Clone, serde::Serialize)]
#[serde(untagged)]
pub(crate) enum IdologyRequestData {
    ExpectId(RequestData),
}
