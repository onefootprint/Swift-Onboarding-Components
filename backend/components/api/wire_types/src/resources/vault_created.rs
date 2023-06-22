use crate::{export_schema, Actor, Apiv2Schema, JsonSchema, Serialize};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct VaultCreated {
    pub actor: Actor,
}

export_schema!(VaultCreated);
