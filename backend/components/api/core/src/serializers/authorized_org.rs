use crate::utils::db2api::DbToApi;
use db::models::{ob_configuration::ObConfiguration, scoped_vault::AuthorizedTenant, tenant::Tenant};

impl DbToApi<AuthorizedTenant> for api_wire_types::AuthorizedOrg {
    fn from_db((_, _, obc, tenant): AuthorizedTenant) -> Self {
        let Tenant {
            name: org_name,
            logo_url,
            ..
        } = tenant;
        let ObConfiguration { can_access_data, .. } = obc;
        Self {
            org_name,
            logo_url,
            can_access_data,
        }
    }
}
