use crate::{
    Actor,
    Apiv2Schema,
    Serialize,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultCreated {
    pub actor: Actor,
}
