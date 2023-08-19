use serde::Deserialize;
use serde::Serialize;
use strum_macros::{Display, EnumDiscriminants};

use crate::PiiJsonValue;
use crate::PiiString;

#[derive(Clone, Deserialize, Serialize, EnumDiscriminants)]
#[strum_discriminants(name(PiiValueKind))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(derive(Display))]
#[serde(untagged)]
pub enum PiiValue {
    String(PiiString),
    Json(PiiJsonValue),
}

impl paperclip::v2::schema::TypedData for PiiValue {
    fn data_type() -> paperclip::v2::models::DataType {
        // TODO this is technically incorrect
        paperclip::v2::models::DataType::String
    }
}

impl std::fmt::Debug for PiiValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let kind = PiiValueKind::from(self);
        f.debug_struct(&format!("PiiValue::{}", kind))
            .field("data", &"<redacted>")
            .finish()
    }
}
