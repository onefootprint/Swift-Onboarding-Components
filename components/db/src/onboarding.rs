use crate::models::insight_event::InsightEvent;
use crate::models::onboardings::Onboarding;
use crate::models::onboardings::OnboardingLink;
use crate::schema;
use crate::{errors::DbError, schema::onboardings::BoxedQuery};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::{Fingerprint, FootprintUserId, Status, TenantId};

#[derive(Clone)]
pub struct OnboardingListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<Status>,
    pub fingerprints: Option<Vec<Fingerprint>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
}

pub fn list_for_tenant_query<'a>(params: OnboardingListQueryParams) -> BoxedQuery<'a, Pg> {
    let mut query = schema::onboardings::table
        .filter(schema::onboardings::tenant_id.eq(params.tenant_id))
        .filter(schema::onboardings::is_live.eq(params.is_live))
        .into_boxed();

    if !params.statuses.is_empty() {
        // TODO https://linear.app/footprint/issue/FP-661/adapt-orgonboardings-to-support-multiple-ob-configurations-per
        let matching_ob_ids = schema::onboarding_links::table
            .filter(schema::onboarding_links::status.eq_any(params.statuses))
            .select(schema::onboarding_links::onboarding_id)
            .distinct();
        query = query.filter(schema::onboardings::id.eq_any(matching_ob_ids))
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
) -> Result<Vec<(Onboarding, OnboardingLink, InsightEvent)>, DbError> {
    let mut onboardings = list_for_tenant_query(params)
        .inner_join(schema::onboarding_links::table)
        .inner_join(
            schema::insight_events::table
                .on(schema::insight_events::id.eq(schema::onboarding_links::insight_event_id)),
        )
        .select((
            schema::onboardings::all_columns,
            schema::onboarding_links::all_columns,
            schema::insight_events::all_columns,
        ))
        .order_by(schema::onboardings::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        onboardings = onboardings.filter(schema::onboardings::ordering_id.le(cursor));
    }

    let onboardings = onboardings.load::<(Onboarding, OnboardingLink, InsightEvent)>(conn)?;
    Ok(onboardings)
}
