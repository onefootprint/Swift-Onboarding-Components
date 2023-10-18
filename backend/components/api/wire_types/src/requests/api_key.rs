use newtypes::input::Csv;

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ApiKeyFilters {
    pub role_ids: Option<Csv<TenantRoleId>>,
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
}
