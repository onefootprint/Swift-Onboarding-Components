use api_wire_types::Actor;
use db::models::tenant_user::TenantUser;

use crate::utils::db2api::DbToApi;

impl DbToApi<Option<TenantUser>> for Actor {
    fn from_db(tenant_user: Option<TenantUser>) -> Self {
        if let Some(tenant_user) = tenant_user {
            Actor::Organization {
                member: tenant_user.email,
            }
        } else {
            Actor::Footprint
        }
    }
}
