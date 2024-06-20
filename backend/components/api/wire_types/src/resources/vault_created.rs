use crate::Actor;
use crate::Apiv2Response;
use crate::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultCreated {
    pub actor: Actor,
}
