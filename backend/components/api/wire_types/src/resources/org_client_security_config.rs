use crate::*;

/// Object that represents a user Onboarding
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OrgClientSecurityConfig {
    pub allowed_origins: Vec<String>,
    pub is_live: bool,
}

export_schema!(OrgClientSecurityConfig);
