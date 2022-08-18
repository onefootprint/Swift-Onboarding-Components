use crate::errors::DbError;
use crate::models::access_event::AccessEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::scoped_user::*;
use crate::models::tenant::Tenant;
use crate::schema;
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::DataKind;
use newtypes::FootprintUserId;
use newtypes::TenantId;
use newtypes::UserVaultId;

#[derive(Debug)]
pub struct AccessEventListQueryParams {
    pub tenant_id: TenantId,
    pub fp_user_id: Option<FootprintUserId>,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub kinds: Vec<DataKind>,
    pub is_live: bool,
}

#[derive(Debug)]
pub struct AccessEventListItemForTenant {
    pub event: AccessEvent,
    pub scoped_user: ScopedUser,
    pub insight: Option<InsightEvent>,
}

impl AccessEventListItemForTenant {
    // lists all access events across all configurations
    pub async fn get(
        pool: &DbPool,
        params: AccessEventListQueryParams,
        cursor: Option<i64>,
        page_size: i64,
    ) -> Result<Vec<Self>, DbError> {
        let result: Vec<(AccessEvent, ScopedUser, Option<InsightEvent>)> = pool
            .db_query(move |conn| {
                let mut results = schema::access_event::table
                    .inner_join(schema::scoped_user::table)
                    .left_join(schema::insight_event::table)
                    .order_by(schema::access_event::ordering_id.desc())
                    .filter(schema::scoped_user::tenant_id.eq(params.tenant_id))
                    .filter(schema::scoped_user::is_live.eq(params.is_live))
                    .limit(page_size)
                    .into_boxed();

                if let Some(fp_user_id) = params.fp_user_id {
                    results = results.filter(schema::scoped_user::fp_user_id.eq(fp_user_id))
                }

                if let Some(search) = params.search {
                    results = results.filter(
                        schema::access_event::reason
                            .ilike(format!("%{}%", search))
                            .or(schema::access_event::principal.ilike(format!("%{}%", search)))
                            .or(schema::scoped_user::fp_user_id.eq(search)),
                    )
                }

                if let Some(timestamp_lte) = params.timestamp_lte {
                    results = results.filter(schema::access_event::timestamp.le(timestamp_lte))
                }

                if let Some(timestamp_gte) = params.timestamp_gte {
                    results = results.filter(schema::access_event::timestamp.ge(timestamp_gte))
                }

                if !params.kinds.is_empty() {
                    results = results.filter(schema::access_event::data_kinds.overlaps_with(params.kinds));
                }

                if let Some(cursor) = cursor {
                    results = results.filter(schema::access_event::ordering_id.le(cursor));
                }

                results.load(conn)
            })
            .await??;

        let result = result
            .into_iter()
            .map(|res| {
                let (event, scoped_user, insight) = res;
                Self {
                    event,
                    scoped_user,
                    insight,
                }
            })
            .collect();

        Ok(result)
    }
}

#[derive(Debug)]
pub struct AccessEventListItemForUser {
    pub event: AccessEvent,
    pub tenant_name: String,
    pub scoped_user: ScopedUser,
}

impl AccessEventListItemForUser {
    /// get access events for a user
    pub async fn get(
        pool: &DbPool,
        user_vault_id: UserVaultId,
        kind: Option<DataKind>,
    ) -> Result<Vec<AccessEventListItemForUser>, DbError> {
        let result: Vec<(AccessEvent, ScopedUser, Tenant)> = pool
            .db_query(move |conn| {
                let mut results = schema::access_event::table
                    .inner_join(schema::scoped_user::table)
                    .inner_join(
                        schema::tenant::table.on(schema::tenant::id.eq(schema::scoped_user::tenant_id)),
                    )
                    .order_by(schema::access_event::timestamp.desc())
                    .filter(schema::scoped_user::user_vault_id.eq(user_vault_id))
                    .into_boxed();

                if let Some(kind) = kind {
                    results = results.filter(schema::access_event::data_kinds.contains(vec![kind]));
                }

                results.load(conn)
            })
            .await??;

        let result = result
            .into_iter()
            .map(|res| {
                let (event, scoped_user, tenant) = res;
                Self {
                    event,
                    scoped_user,
                    tenant_name: tenant.name,
                }
            })
            .collect();

        Ok(result)
    }
}
