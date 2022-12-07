use api_wire_types::Actor;
use db::{actor::SaturatedActor, models::tenant_user::TenantUser};
use newtypes::DbActor;

use crate::utils::db2api::DbToApi;

impl DbToApi<SaturatedActor> for Actor {
    fn from_db(actor: SaturatedActor) -> Self {
        match actor {
            SaturatedActor::TenantUser(tenant_user) => Actor::Organization {
                member: tenant_user.email,
            },
            SaturatedActor::TenantApiKey(_) => Actor::ApiKey,
            SaturatedActor::Footprint => Actor::Footprint,
        }
    }
}
