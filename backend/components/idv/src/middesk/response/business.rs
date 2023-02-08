use newtypes::PiiString;

#[derive(Debug, Clone, serde::Deserialize, PartialEq, Eq)]
pub struct BusinessResponse {
    pub object: Option<String>,
    pub id: Option<String>,
    pub name: Option<PiiString>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub status: Option<String>,
}
