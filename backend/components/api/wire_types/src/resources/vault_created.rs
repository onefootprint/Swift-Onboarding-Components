use crate::{
    Actor,
    Apiv2Response,
    Serialize,
};

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultCreated {
    pub actor: Actor,
}
