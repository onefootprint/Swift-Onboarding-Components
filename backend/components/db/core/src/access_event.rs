use crate::actor::SaturatedActor;
use crate::errors::DbError;
use crate::models::access_event::AccessEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::scoped_vault::*;
use crate::models::tenant::Tenant;
use crate::{
    actor,
    DbPool,
    DbResult,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema;
use diesel::prelude::*;
use newtypes::{
    AccessEventKind,
    DataIdentifier,
    TenantId,
    VaultId,
};
use tracing::instrument;

#[derive(Debug)]
pub struct AccessEventListQueryParams {
    pub tenant_id: TenantId,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub kind: Option<AccessEventKind>,
    pub targets: Vec<DataIdentifier>,
    pub is_live: bool,
}

pub type AccessEventInfo = (AccessEvent, SaturatedActor);

#[derive(Debug)]
pub struct AccessEventListItemForTenant {
    pub event: AccessEventInfo,
    pub scoped_vault: ScopedVault,
    pub insight: Option<InsightEvent>,
}

impl AccessEventListItemForTenant {
    // lists all access events across all configurations
    #[instrument("AccessEventListItemForTenant::get", skip_all)]
    pub async fn get(
        pool: &DbPool,
        params: AccessEventListQueryParams,
        cursor: Option<i64>,
        page_size: i64,
    ) -> Result<Vec<Self>, DbError> {
        let list_items = pool
            .db_query(move |conn| -> DbResult<_> {
                let mut results = schema::access_event::table
                    .inner_join(schema::scoped_vault::table)
                    .left_join(schema::insight_event::table)
                    .inner_join(schema::tenant::table)
                    .order_by(schema::access_event::ordering_id.desc())
                    .filter(schema::access_event::tenant_id.eq(params.tenant_id))
                    .filter(schema::access_event::is_live.eq(params.is_live))
                    .limit(page_size)
                    .into_boxed();

                if let Some(search) = params.search {
                    results = results.filter(schema::scoped_vault::fp_id.eq(search.clone()))
                }

                if let Some(timestamp_lte) = params.timestamp_lte {
                    results = results.filter(schema::access_event::timestamp.le(timestamp_lte))
                }

                if let Some(timestamp_gte) = params.timestamp_gte {
                    results = results.filter(schema::access_event::timestamp.ge(timestamp_gte))
                }

                if let Some(kind) = params.kind {
                    results = results.filter(schema::access_event::kind.eq(kind))
                }

                if !params.targets.is_empty() {
                    results = results.filter(schema::access_event::targets.overlaps_with(params.targets));
                }

                if let Some(cursor) = cursor {
                    results = results.filter(schema::access_event::ordering_id.le(cursor));
                }

                let results: Vec<(AccessEvent, ScopedVault, Option<InsightEvent>, Tenant)> =
                    results.load(conn)?;

                // Saturate the actors from the DB
                let access_events: Vec<AccessEvent> = results.iter().map(|r| r.0.clone()).collect();
                let access_event_infos = actor::saturate_actors(conn, access_events)?;
                let results = results
                    .into_iter()
                    .zip(access_event_infos.into_iter())
                    .map(|((_, scoped_user, insight_event, _), access_event_info)| Self {
                        event: access_event_info,
                        scoped_vault: scoped_user,
                        insight: insight_event,
                    })
                    .collect();

                Ok(results)
            })
            .await?;

        Ok(list_items)
    }
}

#[derive(Debug)]
pub struct AccessEventListItemForUser {
    pub event: AccessEventInfo,
    pub tenant_name: String,
    pub scoped_vault: ScopedVault,
}

impl AccessEventListItemForUser {
    /// get access events for a user
    #[instrument("AccessEventListItemForUser::get", skip_all)]
    pub async fn get(pool: &DbPool, vault_id: VaultId) -> Result<Vec<Self>, DbError> {
        let list_items = pool
            .db_query(move |conn| -> DbResult<_> {
                let results: Vec<(AccessEvent, ScopedVault, Tenant)> = schema::access_event::table
                    .inner_join(schema::scoped_vault::table)
                    .inner_join(
                        schema::tenant::table.on(schema::tenant::id.eq(schema::scoped_vault::tenant_id)),
                    )
                    .order_by(schema::access_event::timestamp.desc())
                    .filter(schema::scoped_vault::vault_id.eq(vault_id))
                    // Include deactivated scoped vaults.
                    .load(conn)?;

                // Saturate the actors on the access events
                let access_events = results.iter().map(|e| e.0.clone()).collect();
                let access_event_infos = actor::saturate_actors(conn, access_events)?;
                let results = results
                    .into_iter()
                    .zip(access_event_infos.into_iter())
                    .map(|((_, scoped_user, tenant), access_event_info)| Self {
                        event: access_event_info,
                        scoped_vault: scoped_user,
                        tenant_name: tenant.name,
                    })
                    .collect();
                Ok(results)
            })
            .await?;

        Ok(list_items)
    }
}
