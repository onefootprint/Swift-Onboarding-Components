use crate::CreateTokenResponse;
use newtypes::EntityAction;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct EntityActionsRequest {
    pub actions: Vec<EntityAction>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, derive_more::From)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum EntityActionResponse {
    Trigger(CreateTokenResponse),
}
