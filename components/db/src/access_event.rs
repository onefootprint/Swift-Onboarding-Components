use crate::errors::DbError;
use crate::models::access_events::AccessEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::onboardings::*;
use crate::schema;
use crate::DbPool;
use diesel::prelude::*;
use newtypes::DataKind;
use newtypes::FootprintUserId;
use newtypes::TenantId;
use newtypes::UserVaultId;

// lists all access events across all configurations
pub async fn list_for_tenant(
    pool: &DbPool,
    tenant_id: TenantId,
    fp_user_id: Option<FootprintUserId>,
    kind: Option<DataKind>,
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
                .filter(schema::onboardings::tenant_id.eq(tenant_id))
                .limit(page_size)
                .into_boxed();

            if let Some(fp_user_id) = fp_user_id {
                results = results.filter(schema::onboardings::user_ob_id.eq(fp_user_id))
            }

            if let Some(kind) = kind {
                results = results.filter(schema::access_events::data_kinds.contains(vec![kind]));
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
