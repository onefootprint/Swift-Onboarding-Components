use crate::DataIdentifier;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;


#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, AsJsonb, Apiv2Schema, macros::SerdeAttr)]
#[serde(rename_all = "snake_case")]
pub struct CustomDocumentConfig {
    /// Custom document identifier under which the document will be vaulted
    pub identifier: DataIdentifier,
    /// The human-readable name of the document to display to the user
    pub name: String,
    /// Optional human-readable description of the document that will be displayed to the user
    pub description: Option<String>,
    // pub accepted_types: Vec<DocumentType>, // image? pdf?
}
