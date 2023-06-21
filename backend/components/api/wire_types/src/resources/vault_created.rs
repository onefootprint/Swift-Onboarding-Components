use crate::{export_schema, Actor, Apiv2Schema, Deserialize, JsonSchema, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct VaultCreated {
    pub actor: Actor,
}

export_schema!(VaultCreated);
