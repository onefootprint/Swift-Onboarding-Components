#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, DieselNewType, Default)]
pub struct TenantUserEmail(String);

impl From<String> for TenantUserEmail {
    fn from(s: String) -> Self {
        Self(s.to_lowercase())
    }
}
