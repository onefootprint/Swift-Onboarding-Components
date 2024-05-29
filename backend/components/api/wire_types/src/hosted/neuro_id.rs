use crate::*;
use newtypes::NeuroIdentityId;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct NeuroIdentityIdResponse {
    pub id: NeuroIdentityId,
}
