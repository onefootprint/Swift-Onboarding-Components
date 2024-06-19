use crate::*;
use newtypes::NeuroIdentityId;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct NeuroIdentityIdResponse {
    pub id: NeuroIdentityId,
}
