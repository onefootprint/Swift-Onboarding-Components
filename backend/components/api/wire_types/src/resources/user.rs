use crate::*;

/// Basic information about a user
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct User {
    pub id: FpId,
}

export_schema!(User);
