use crate::errors::DbError;
use crate::models::access_events::AccessEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::onboardings::*;
use crate::schema;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use newtypes::DataKind;
use newtypes::FootprintUserId;
use newtypes::TenantId;
use newtypes::UserVaultId;

#[derive(Debug)]
pub struct AccessEventListQueryParams {
    pub tenant_id: TenantId,
    pub fp_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<NaiveDateTime>,
    pub timestamp_gte: Option<NaiveDateTime>,
    pub kinds: Vec<DataKind>,
}

// lists all access events across all configurations
pub async fn list_for_tenant(
    pool: &DbPool,
    params: AccessEventListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<(AccessEvent, Onboarding, Option<InsightEvent>)>, DbError> {
    let conn = pool.get().await?;
    let result = conn
        .interact(move |conn| {
            let mut results = schema::access_events::table
                .inner_join(schema::onboardings::table)
                .left_join(
                    schema::insight_events::table
                        .on(schema::access_events::insight_event_id.eq(schema::insight_events::id)),
                )
                .order_by(schema::access_events::ordering_id.desc())
                .filter(schema::onboardings::tenant_id.eq(params.tenant_id))
                .limit(page_size)
                .into_boxed();

            if let Some(fp_user_id) = params.fp_user_id {
                results = results.filter(schema::onboardings::user_ob_id.eq(fp_user_id))
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
    Ok(result)
}

pub async fn list(
    pool: &DbPool,
    user_vault_id: UserVaultId,
    kind: Option<DataKind>,
) -> Result<Vec<(AccessEvent, Onboarding, Option<InsightEvent>)>, DbError> {
    let conn = pool.get().await?;
    let result = conn
        .interact(move |conn| {
            let mut results = schema::access_events::table
                .inner_join(schema::onboardings::table)
                .left_join(
                    schema::insight_events::table
                        .on(schema::access_events::insight_event_id.eq(schema::insight_events::id)),
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
    Ok(result)
}
