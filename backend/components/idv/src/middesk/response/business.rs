use newtypes::PiiString;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct BusinessResponse {
    pub object: Option<String>,
    pub id: Option<String>,
    pub name: Option<PiiString>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub status: Option<String>,
}
