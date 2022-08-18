use db::models::tenant::Tenant;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiTenant {
    name: String,
    logo_url: Option<String>,
    is_sandbox_restricted: bool,
}

impl From<Tenant> for ApiTenant {
    fn from(t: Tenant) -> Self {
        let Tenant {
            name,
            logo_url,
            sandbox_restricted,
            ..
        } = t;
        Self {
            name,
            logo_url,
            is_sandbox_restricted: sandbox_restricted,
        }
    }
}
