use crate::utils::db2api::DbToApi;
use db::access_event::{
    AccessEventListItemForTenant,
    AccessEventListItemForUser,
};
use db::actor::SaturatedActor;

fn saturated_actor_to_principal_string(saturated_actor: &SaturatedActor) -> String {
    match saturated_actor {
        db::actor::SaturatedActor::User(_) => "Data Owner".to_string(), /* The access_event table doesn't */
        // actually use this variant.
        db::actor::SaturatedActor::TenantUser(tu) => tu.email.0.clone(),
        db::actor::SaturatedActor::TenantApiKey(tak) => tak.name.clone(),
        db::actor::SaturatedActor::Footprint => "Footprint".to_owned(),
        db::actor::SaturatedActor::FirmEmployee(_) => "Footprint".to_owned(),
    }
}

impl DbToApi<AccessEventListItemForUser> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForUser) -> Self {
        let AccessEventListItemForUser {
            event,
            tenant_name: _,
            scoped_vault: scoped_user,
        } = evt;
        let (event, saturated_actor) = event;

        api_wire_types::AccessEvent {
            fp_id: scoped_user.fp_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: saturated_actor_to_principal_string(&saturated_actor), /* TODO: change to
                                                                               * Actor::from_db when
                                                                               * frontend can support it */
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: None, // we don't want to expose tenant location to end user
            kind: event.kind,
            targets: event.targets,
        }
    }
}

impl DbToApi<AccessEventListItemForTenant> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForTenant) -> Self {
        let AccessEventListItemForTenant {
            event,
            scoped_vault: scoped_user,
            insight,
        } = evt;
        let (event, saturated_actor) = event;

        api_wire_types::AccessEvent {
            fp_id: scoped_user.fp_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: saturated_actor_to_principal_string(&saturated_actor), /* TODO: change to
                                                                               * Actor::from_db when
                                                                               * frontend can support it */
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: insight.map(api_wire_types::InsightEvent::from_db),
            kind: event.kind,
            targets: event.targets,
        }
    }
}
