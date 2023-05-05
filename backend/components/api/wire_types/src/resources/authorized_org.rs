use crate::*;

#[derive(serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct AuthorizedOrg {
    pub org_name: String,
    pub logo_url: Option<String>,
    pub can_access_data: Vec<CollectedDataOption>,
}
