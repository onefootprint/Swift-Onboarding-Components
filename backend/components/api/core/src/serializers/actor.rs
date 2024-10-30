use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use db::actor::SaturatedActor;

impl DbToApi<SaturatedActor> for Actor {
    fn from_db(actor: SaturatedActor) -> Self {
        match actor {
            SaturatedActor::User(sv) => Actor::User { id: sv.fp_id },
            SaturatedActor::TenantUser(tenant_user) => {
                let name = match (tenant_user.first_name.clone(), tenant_user.last_name.clone()) {
                    (None, None) => None,
                    (None, Some(last)) => Some(last),
                    (Some(first), None) => Some(first),
                    (Some(first), Some(last)) => Some(format!("{} {}", first, last)),
                };
                let email = tenant_user.email.0.clone();
                let member = match name {
                    Some(name) => format!("{} ({})", name, email),
                    None => email,
                };
                Actor::Organization {
                    member,
                    first_name: tenant_user.first_name,
                    last_name: tenant_user.last_name,
                    email: tenant_user.email.0,
                }
            }
            SaturatedActor::TenantApiKey(tak) => Actor::ApiKey {
                id: tak.id,
                name: tak.name,
            },
            SaturatedActor::Footprint => Actor::Footprint,
            // Don't serialize any information on which firm employee performed the action. Maybe
            // one day we will show this when authed as a firm employee
            SaturatedActor::FirmEmployee(_) => Actor::FirmEmployee,
        }
    }
}
