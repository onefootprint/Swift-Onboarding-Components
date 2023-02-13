use newtypes::PiiString;

#[derive(Debug, Clone, serde::Serialize)]
pub struct CrossCoreJwtTokenRequest {
    pub username: PiiString,
    pub password: PiiString,
    pub client_id: PiiString,
    pub client_secret: PiiString,
}
