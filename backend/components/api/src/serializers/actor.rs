use api_wire_types::Actor;
use db::actor::SaturatedActor;

use crate::utils::db2api::DbToApi;

impl DbToApi<SaturatedActor> for Actor {
    fn from_db(actor: SaturatedActor) -> Self {
        match actor {
            SaturatedActor::TenantUser(tenant_user) => {
                let mut name = match (tenant_user.first_name, tenant_user.last_name) {
                    (None, None) => None,
                    (None, Some(last)) => Some(last),
                    (Some(first), None) => Some(first),
                    (Some(first), Some(last)) => Some(format!("{} {}", first, last)),
                };
                Actor::Organization {
                    member: name.get_or_insert(tenant_user.email.0).clone(),
                }
            }
            SaturatedActor::TenantApiKey(_) => Actor::ApiKey,
            SaturatedActor::Footprint => Actor::Footprint,
        }
    }
}
