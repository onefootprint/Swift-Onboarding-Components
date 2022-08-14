use crate::models::scoped_users::ScopedUser;
use crate::schema;
use crate::{errors::DbError, schema::scoped_users::BoxedQuery};
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
    let mut query = schema::scoped_users::table
        .filter(schema::scoped_users::tenant_id.eq(params.tenant_id))
        .filter(schema::scoped_users::is_live.eq(params.is_live))
        .into_boxed();

    if !params.statuses.is_empty() {
        // TODO https://linear.app/footprint/issue/FP-661/adapt-orgonboardings-to-support-multiple-ob-configurations-per
        let matching_ob_ids = schema::onboardings::table
            .filter(schema::onboardings::status.eq_any(params.statuses))
            .select(schema::onboardings::scoped_user_id)
            .distinct();
        query = query.filter(schema::scoped_users::id.eq_any(matching_ob_ids))
    }

    if let Some(footprint_user_id) = params.footprint_user_id {
        query = query.filter(schema::scoped_users::fp_user_id.eq(footprint_user_id))
    }

    if let Some(timestamp_lte) = params.timestamp_lte {
        query = query.filter(schema::scoped_users::start_timestamp.le(timestamp_lte))
    }

    if let Some(timestamp_gte) = params.timestamp_gte {
        query = query.filter(schema::scoped_users::start_timestamp.ge(timestamp_gte))
    }

    if let Some(fingerprints) = params.fingerprints {
        let matching_uv_ids = schema::fingerprint::table
            .filter(schema::fingerprint::user_vault_id.eq(schema::scoped_users::user_vault_id))
            .filter(schema::fingerprint::deactivated_at.is_null())
            .filter(schema::fingerprint::sh_data.eq_any(fingerprints))
            .select(schema::fingerprint::user_vault_id)
            .distinct();
        query = query.filter(schema::scoped_users::user_vault_id.eq_any(matching_uv_ids))
    }

    query
}

pub fn count_for_tenant(conn: &mut PgConnection, params: OnboardingListQueryParams) -> Result<i64, DbError> {
    let count = list_for_tenant_query(params).count().get_result(conn)?;
    Ok(count)
}

/// lists all scoped_users across all configurations
pub fn list_for_tenant(
    conn: &mut PgConnection,
    params: OnboardingListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<ScopedUser>, DbError> {
    let mut scoped_users = list_for_tenant_query(params)
        .order_by(schema::scoped_users::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        scoped_users = scoped_users.filter(schema::scoped_users::ordering_id.le(cursor));
    }

    let scoped_users = scoped_users.load::<ScopedUser>(conn)?;
    Ok(scoped_users)
}
