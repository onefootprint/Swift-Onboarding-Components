use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct Organization {
    pub name: String,
    pub logo_url: Option<String>,
    pub is_sandbox_restricted: bool,
}
export_schema!(Organization);
