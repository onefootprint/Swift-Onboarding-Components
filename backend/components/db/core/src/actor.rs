use std::collections::HashMap;

use crate::PgConn;
use newtypes::{DbActor, TenantApiKeyId, TenantUserId};

use crate::{
    models::{
        access_event::AccessEvent, annotation::Annotation, onboarding_decision::OnboardingDecision,
        tenant_api_key::TenantApiKey, tenant_user::TenantUser,
    },
    DbError, DbResult,
};
use db_schema::schema::{tenant_api_key, tenant_user};
use diesel::prelude::*;
#[derive(Clone, Debug)]
pub enum SaturatedActor {
    TenantUser(TenantUser),
    TenantApiKey(TenantApiKey),
    Footprint,
    FirmEmployee(TenantUser),
}

pub trait HasActor {
    fn actor(&self) -> DbActor;
}

impl HasActor for Annotation {
    fn actor(&self) -> DbActor {
        self.actor.clone()
    }
}

impl HasActor for OnboardingDecision {
    fn actor(&self) -> DbActor {
        self.actor.clone()
    }
}

impl HasActor for AccessEvent {
    fn actor(&self) -> DbActor {
        self.principal.clone()
    }
}

impl HasActor for DbActor {
    fn actor(&self) -> DbActor {
        self.clone()
    }
}

pub fn saturate_actors<T>(conn: &mut PgConn, has_actors: Vec<T>) -> DbResult<Vec<(T, SaturatedActor)>>
where
    T: HasActor,
{
    let actors: Vec<DbActor> = has_actors.iter().map(|ha| ha.actor()).collect();

    let tenant_user_ids = actors.iter().flat_map(|a| match a {
        DbActor::TenantUser { id } => Some(id),
        DbActor::FirmEmployee { id } => Some(id),
        _ => None,
    });

    let tenant_api_key_ids = actors.iter().flat_map(|a| match a {
        DbActor::TenantApiKey { id } => Some(id),
        _ => None,
    });

    let tenant_users_map: HashMap<TenantUserId, TenantUser> = tenant_user::table
        .filter(tenant_user::id.eq_any(tenant_user_ids))
        .get_results::<TenantUser>(conn)?
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

    let tenant_api_keys_map: HashMap<TenantApiKeyId, TenantApiKey> = tenant_api_key::table
        .filter(tenant_api_key::id.eq_any(tenant_api_key_ids))
        .get_results::<TenantApiKey>(conn)?
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

    let has_actors_with_saturated_actors: Vec<(T, SaturatedActor)> = has_actors
        .into_iter()
        .map(|ha| {
            let saturated_actor = match ha.actor() {
                DbActor::TenantUser { id } => SaturatedActor::TenantUser(
                    tenant_users_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                ),
                DbActor::TenantApiKey { id } => SaturatedActor::TenantApiKey(
                    tenant_api_keys_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                ),
                DbActor::Footprint => SaturatedActor::Footprint,
                DbActor::FirmEmployee { id } => SaturatedActor::FirmEmployee(
                    tenant_users_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                ),
            };
            Ok((ha, saturated_actor))
        })
        .collect::<DbResult<Vec<_>>>()?;

    Ok(has_actors_with_saturated_actors)
}
