use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrStatus {
    pub org_id: String,
    pub org_name: String,
    pub is_live: bool,
}
