use crate::models::insight_event::InsightEvent;
use crate::models::ob_configurations::ObConfiguration;
use crate::models::onboardings::Onboarding;
use crate::models::onboardings::OnboardingLink;
use crate::schema;
use crate::DbPool;
use crate::{errors::DbError, schema::onboardings::BoxedQuery};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::OnboardingId;
use newtypes::{Fingerprint, FootprintUserId, ObConfigurationId, Status, TenantId, UserVaultId};

#[derive(Clone)]
pub struct OnboardingListQueryParams {
    pub tenant_id: TenantId,
    pub statuses: Vec<Status>,
    pub fingerprints: Option<Vec<Fingerprint>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
}

pub fn list_for_tenant_query<'a>(params: OnboardingListQueryParams) -> BoxedQuery<'a, Pg> {
    let mut query = schema::onboardings::table
        .filter(schema::onboardings::tenant_id.eq(params.tenant_id))
        .into_boxed();

    if !params.statuses.is_empty() {
        query = query.filter(schema::onboardings::status.eq_any(params.statuses))
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

    if let Some(fingerprints) = params.fingerprints {
        let matching_uv_ids = schema::user_data::table
            .filter(schema::user_data::user_vault_id.eq(schema::onboardings::user_vault_id))
            .filter(schema::user_data::deactivated_at.is_null())
            .filter(schema::user_data::sh_data.eq_any(fingerprints))
            .select(schema::user_data::user_vault_id)
            .distinct();
        query = query.filter(schema::onboardings::user_vault_id.eq_any(matching_uv_ids))
    }

    query
}

pub fn count_for_tenant(conn: &mut PgConnection, params: OnboardingListQueryParams) -> Result<i64, DbError> {
    let count = list_for_tenant_query(params).count().get_result(conn)?;
    Ok(count)
}

/// lists all onboardings across all configurations
pub fn list_for_tenant(
    conn: &mut PgConnection,
    params: OnboardingListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<(Onboarding, InsightEvent)>, DbError> {
    let mut onboardings = list_for_tenant_query(params)
        .inner_join(schema::insight_events::table)
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
    conn: &mut PgConnection,
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
    pool: &DbPool,
    id: ObConfigurationId,
    user_vault_id: UserVaultId,
) -> Result<Option<Onboarding>, DbError> {
    let ob = pool
        .db_query(|conn| -> Result<Option<Onboarding>, DbError> {
            let ob = schema::onboardings::table
                .inner_join(schema::onboarding_links::table)
                .filter(schema::onboarding_links::ob_configuration_id.eq(id))
                .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                .select(schema::onboardings::all_columns)
                .first(conn)
                .optional()?;
            Ok(ob)
        })
        .await??;
    Ok(ob)
}

pub async fn get_by_onboarding_id_and_tenant(
    pool: &DbPool,
    id: OnboardingId,
    tenant_id: TenantId,
) -> Result<Onboarding, DbError> {
    let ob = pool
        .db_query(|conn| -> Result<Onboarding, DbError> {
            let ob = schema::onboardings::table
                .filter(schema::onboardings::id.eq(id))
                .filter(schema::onboardings::tenant_id.eq(tenant_id))
                .first(conn)?;
            Ok(ob)
        })
        .await??;
    Ok(ob)
}

/// get onboardings by a specific user vault
pub async fn list_for_user_vault(
    pool: &DbPool,
    user_vault_id: UserVaultId,
) -> Result<Vec<(Onboarding, OnboardingLink, ObConfiguration, InsightEvent)>, DbError> {
    let results = pool
        .db_query(|conn| -> Result<_, DbError> {
            let results = schema::onboardings::table
                .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                .inner_join(schema::onboarding_links::table)
                .inner_join(
                    schema::ob_configurations::table
                        .on(schema::ob_configurations::id.eq(schema::onboarding_links::ob_configuration_id)),
                )
                .inner_join(schema::insight_events::table)
                .get_results(conn)?;
            Ok(results)
        })
        .await??;
    Ok(results)
}
