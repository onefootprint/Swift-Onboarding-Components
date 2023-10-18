use crate::*;

/// Object that represents a user Onboarding
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OrgClientSecurityConfig {
    pub allowed_origins: Vec<String>,
    pub is_live: bool,
}
