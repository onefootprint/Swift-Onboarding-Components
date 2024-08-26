use crate::*;
use newtypes::TagId;
use newtypes::TagKind;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct UserTag {
    #[openapi(example = "tag_2ZwAl6LyHB6l7Ap2Ksdw8X")]
    pub id: TagId,
    #[openapi(example = "transaction_chargeback")]
    pub tag: TagKind,
    pub created_at: DateTime<Utc>,
}
