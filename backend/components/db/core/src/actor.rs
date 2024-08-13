use crate::models::annotation::Annotation;
use crate::models::audit_event::AuditEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::models::onboarding_decision::OnboardingDecision;
use crate::models::scoped_vault::ScopedVault;
use crate::models::tenant_api_key::TenantApiKey;
use crate::models::tenant_user::TenantUser;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use db_schema::schema::scoped_vault;
use db_schema::schema::tenant_api_key;
use db_schema::schema::tenant_user;
use diesel::prelude::*;
use newtypes::DbActor;
use newtypes::ScopedVaultId;
use newtypes::TenantApiKeyId;
use newtypes::TenantUserId;
use std::collections::HashMap;
use tracing::instrument;

#[derive(Clone, Debug)]
pub enum SaturatedActor {
    User(ScopedVault),
    TenantUser(TenantUser),
    TenantApiKey(TenantApiKey),
    Footprint,
    FirmEmployee(TenantUser),
}

pub trait HasActor {
    fn actor(&self) -> Option<DbActor>;
}

impl HasActor for Annotation {
    fn actor(&self) -> Option<DbActor> {
        Some(self.actor.clone())
    }
}

impl HasActor for OnboardingDecision {
    fn actor(&self) -> Option<DbActor> {
        Some(self.actor.clone())
    }
}

impl HasActor for ObConfiguration {
    fn actor(&self) -> Option<DbActor> {
        self.author.clone()
    }
}

impl HasActor for AuditEvent {
    fn actor(&self) -> Option<DbActor> {
        Some(self.principal_actor.clone())
    }
}

impl HasActor for DbActor {
    fn actor(&self) -> Option<DbActor> {
        Some(self.clone())
    }
}

#[instrument(skip_all)]
pub fn saturate_actors<T>(conn: &mut PgConn, has_actors: Vec<T>) -> DbResult<Vec<(T, SaturatedActor)>>
where
    T: HasActor,
{
    let results = saturate_actors_nullable(conn, has_actors)?
        .into_iter()
        .filter_map(|(ha, a)| a.map(|a| (ha, a)))
        .collect();
    Ok(results)
}

#[instrument(skip_all)]
pub fn saturate_actors_nullable<T>(
    conn: &mut PgConn,
    has_actors: Vec<T>,
) -> DbResult<Vec<(T, Option<SaturatedActor>)>>
where
    T: HasActor,
{
    let actors: Vec<DbActor> = has_actors.iter().filter_map(|ha| ha.actor()).collect();

    let scoped_vault_ids = actors.iter().flat_map(|a| match a {
        DbActor::User { id } => Some(id),
        _ => None,
    });

    let tenant_user_ids = actors.iter().flat_map(|a| match a {
        DbActor::TenantUser { id } => Some(id),
        DbActor::FirmEmployee { id } => Some(id),
        _ => None,
    });

    let tenant_api_key_ids = actors.iter().flat_map(|a| match a {
        DbActor::TenantApiKey { id } => Some(id),
        _ => None,
    });

    let scoped_vault_map: HashMap<ScopedVaultId, ScopedVault> = scoped_vault::table
        .filter(scoped_vault::id.eq_any(scoped_vault_ids))
        .get_results::<ScopedVault>(conn)?
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

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

    let has_actors_with_saturated_actors: Vec<(T, Option<SaturatedActor>)> = has_actors
        .into_iter()
        .map(|ha| {
            let saturated_actor = match ha.actor() {
                Some(DbActor::User { id }) => Some(SaturatedActor::User(
                    scoped_vault_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                )),
                Some(DbActor::TenantUser { id }) => Some(SaturatedActor::TenantUser(
                    tenant_users_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                )),
                Some(DbActor::TenantApiKey { id }) => Some(SaturatedActor::TenantApiKey(
                    tenant_api_keys_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                )),
                Some(DbActor::Footprint) => Some(SaturatedActor::Footprint),
                Some(DbActor::FirmEmployee { id }) => Some(SaturatedActor::FirmEmployee(
                    tenant_users_map
                        .get(&id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone(),
                )),
                None => None,
            };
            Ok((ha, saturated_actor))
        })
        .collect::<DbResult<Vec<_>>>()?;

    Ok(has_actors_with_saturated_actors)
}

#[instrument(skip_all)]
pub fn saturate_actor_nullable<T>(conn: &mut PgConn, has_actor: T) -> DbResult<(T, Option<SaturatedActor>)>
where
    T: HasActor,
{
    let result = saturate_actors_nullable(conn, vec![has_actor])?
        .into_iter()
        .next()
        .ok_or(DbError::ObjectNotFound)?;
    Ok(result)
}
