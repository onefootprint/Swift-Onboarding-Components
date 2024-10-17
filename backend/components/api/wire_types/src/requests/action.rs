use crate::CreateTokenResponse;
use newtypes::EntityAction;
use newtypes::FpId;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct EntityActionsRequest {
    pub actions: Vec<EntityAction>,
    pub fp_bid: Option<FpId>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, derive_more::From, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum EntityActionResponse {
    Trigger(CreateTokenResponse),
}
