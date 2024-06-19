use crate::*;
use newtypes::CollectedDataOption;

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuthorizedOrg {
    pub org_name: String,
    pub logo_url: Option<String>,
    pub can_access_data: Vec<CollectedDataOption>,
}
