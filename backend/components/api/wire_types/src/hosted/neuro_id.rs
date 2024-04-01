use newtypes::NeuroIdentityId;

use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct NeuroIdentityIdResponse {
    pub id: NeuroIdentityId,
}
