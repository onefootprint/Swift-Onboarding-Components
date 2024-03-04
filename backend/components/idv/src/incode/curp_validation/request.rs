use newtypes::PiiString;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurpValidationRequest {
    pub curp: PiiString,
}
