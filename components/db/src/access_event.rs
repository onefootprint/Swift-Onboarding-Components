use crate::errors::DbError;
use crate::models::access_events::AccessEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::onboardings::*;
use crate::models::tenants::Tenant;
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
    pub onboarding: Onboarding,
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
        let result: Vec<(AccessEvent, Onboarding, Option<InsightEvent>)> = pool
            .db_query(move |conn| {
                let mut results = schema::access_events::table
                    .inner_join(schema::onboardings::table)
                    .left_join(schema::insight_events::table)
                    .order_by(schema::access_events::ordering_id.desc())
                    .filter(schema::onboardings::tenant_id.eq(params.tenant_id))
                    .filter(schema::onboardings::is_live.eq(params.is_live))
                    .limit(page_size)
                    .into_boxed();

                if let Some(fp_user_id) = params.fp_user_id {
                    results = results.filter(schema::onboardings::user_ob_id.eq(fp_user_id))
                }

                if let Some(search) = params.search {
                    results = results.filter(
                        schema::access_events::reason
                            .ilike(format!("%{}%", search))
                            .or(schema::access_events::principal.ilike(format!("%{}%", search)))
                            .or(schema::onboardings::user_ob_id.eq(search)),
                    )
                }

                if let Some(timestamp_lte) = params.timestamp_lte {
                    results = results.filter(schema::access_events::timestamp.le(timestamp_lte))
                }

                if let Some(timestamp_gte) = params.timestamp_gte {
                    results = results.filter(schema::access_events::timestamp.ge(timestamp_gte))
                }

                if !params.kinds.is_empty() {
                    results = results.filter(schema::access_events::data_kinds.overlaps_with(params.kinds));
                }

                if let Some(cursor) = cursor {
                    results = results.filter(schema::access_events::ordering_id.le(cursor));
                }

                results.load(conn)
            })
            .await??;

        let result = result
            .into_iter()
            .map(|res| {
                let (event, onboarding, insight) = res;
                Self {
                    event,
                    onboarding,
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
    pub onboarding: Onboarding,
}

impl AccessEventListItemForUser {
    /// get access events for a user
    pub async fn get(
        pool: &DbPool,
        user_vault_id: UserVaultId,
        kind: Option<DataKind>,
    ) -> Result<Vec<AccessEventListItemForUser>, DbError> {
        let result: Vec<(AccessEvent, Onboarding, Tenant)> = pool
            .db_query(move |conn| {
                let mut results = schema::access_events::table
                    .inner_join(schema::onboardings::table)
                    .inner_join(
                        schema::tenants::table.on(schema::tenants::id.eq(schema::onboardings::tenant_id)),
                    )
                    .order_by(schema::access_events::timestamp.desc())
                    .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                    .into_boxed();

                if let Some(kind) = kind {
                    results = results.filter(schema::access_events::data_kinds.contains(vec![kind]));
                }

                results.load(conn)
            })
            .await??;

        let result = result
            .into_iter()
            .map(|res| {
                let (event, onboarding, tenant) = res;
                Self {
                    event,
                    onboarding,
                    tenant_name: tenant.name,
                }
            })
            .collect();

        Ok(result)
    }
}
