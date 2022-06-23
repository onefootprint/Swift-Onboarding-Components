use crate::models::insight_event::InsightEvent;
use crate::models::onboardings::Onboarding;
use crate::schema;
use crate::{errors::DbError, schema::onboardings::BoxedQuery};
use chrono::NaiveDateTime;
use deadpool_diesel::postgres::Pool;
use diesel::dsl::any;
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::{FootprintUserId, ObConfigurationId, Status, TenantId, UserVaultId};

#[derive(Clone)]
pub struct OnboardingListQueryParams {
    pub tenant_id: TenantId,
    pub statuses: Vec<Status>,
    pub fingerprint: Option<Vec<u8>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<NaiveDateTime>,
    pub timestamp_gte: Option<NaiveDateTime>,
}

pub fn list_for_tenant_query<'a>(params: OnboardingListQueryParams) -> BoxedQuery<'a, Pg> {
    let mut query = schema::onboardings::table
        .filter(schema::onboardings::tenant_id.eq(params.tenant_id))
        .into_boxed();

    if !params.statuses.is_empty() {
        query = query.filter(schema::onboardings::status.eq(any(params.statuses)))
    }

    if let Some(footprint_user_id) = params.footprint_user_id {
        query = query.filter(schema::onboardings::user_ob_id.eq(footprint_user_id))
    }

    if let Some(timestamp_lte) = params.timestamp_lte {
        query = query.filter(schema::onboardings::start_timestamp.le(timestamp_lte))
    }

    if let Some(timestamp_gte) = params.timestamp_gte {
        query = query.filter(schema::onboardings::start_timestamp.ge(timestamp_gte))
    }

    if let Some(fingerprint) = params.fingerprint {
        let matching_uv_ids = schema::user_data::table
            .filter(schema::user_data::user_vault_id.eq(schema::onboardings::user_vault_id))
            .filter(schema::user_data::deactivated_at.is_null())
            .filter(schema::user_data::sh_data.eq(fingerprint))
            .select(schema::user_data::user_vault_id)
            .distinct();
        query = query.filter(schema::onboardings::user_vault_id.eq(any(matching_uv_ids)))
    }

    query
}

pub fn count_for_tenant(conn: &PgConnection, params: OnboardingListQueryParams) -> Result<i64, DbError> {
    let count = list_for_tenant_query(params).count().get_result(conn)?;
    Ok(count)
}

// lists all onboardings across all configurations
pub fn list_for_tenant(
    conn: &PgConnection,
    params: OnboardingListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<(Onboarding, InsightEvent)>, DbError> {
    let mut onboardings = list_for_tenant_query(params)
        .inner_join(
            schema::insight_events::table
                .on(schema::insight_events::id.eq(schema::onboardings::start_insight_event_id)),
        )
        .select((
            schema::onboardings::all_columns,
            schema::insight_events::all_columns,
        ))
        .order_by(schema::onboardings::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        onboardings = onboardings.filter(schema::onboardings::ordering_id.le(cursor));
    }

    let onboardings = onboardings.load::<(Onboarding, InsightEvent)>(conn)?;
    Ok(onboardings)
}

pub(crate) fn get_for_fp_id(
    conn: &PgConnection,
    tenant_id: TenantId,
    footprint_user_id: FootprintUserId,
) -> Result<Option<Onboarding>, DbError> {
    let ob = schema::onboardings::table
        .filter(schema::onboardings::tenant_id.eq(tenant_id))
        .filter(schema::onboardings::user_ob_id.eq(footprint_user_id))
        .first(conn)
        .optional()?;
    Ok(ob)
}

pub async fn get(
    pool: &Pool,
    id: ObConfigurationId,
    user_vault_id: UserVaultId,
) -> Result<Option<Onboarding>, DbError> {
    let conn = pool.get().await?;

    let ob = conn
        .interact(|conn| -> Result<Option<Onboarding>, DbError> {
            let ob = schema::onboardings::table
                .filter(schema::onboardings::ob_config_id.eq(id))
                .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                .first(conn)
                .optional()?;
            Ok(ob)
        })
        .await??;
    Ok(ob)
}
