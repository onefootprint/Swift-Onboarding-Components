use crate::models::scoped_user::ScopedUser;
use crate::models::user_vault::UserVault;
use crate::schema;
use crate::{errors::DbError, schema::scoped_user::BoxedQuery};
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::{DecisionStatus, Fingerprint, FootprintUserId, OnboardingStatus, TenantId};

#[derive(Clone)]
pub struct OnboardingListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<OnboardingStatus>,
    pub fingerprints: Option<Vec<Fingerprint>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
}

pub fn list_authorized_for_tenant_query<'a>(params: OnboardingListQueryParams) -> BoxedQuery<'a, Pg> {
    // Filter out onboardings that haven't been explicitly authorized by the user - these should
    // not be visible in the dashboard since the tenant doesn't have permissions to view anything
    // about the user
    use crate::schema::{
        data_lifetime, fingerprint, manual_review, onboarding, onboarding_decision, scoped_user,
    };
    let authorized_ids = onboarding::table
        .filter(onboarding::is_authorized.eq(true))
        .select(onboarding::scoped_user_id)
        .distinct();

    let mut query = scoped_user::table
        .filter(scoped_user::tenant_id.eq(params.tenant_id))
        .filter(scoped_user::is_live.eq(params.is_live))
        .filter(scoped_user::id.eq_any(authorized_ids))
        .into_boxed();

    // Filter on whether user is in manual review
    if let Some(requires_manual_review) = params.requires_manual_review {
        let matching_ids = manual_review::table
            .inner_join(onboarding::table)
            .filter(manual_review::completed_at.is_null())
            .select(onboarding::scoped_user_id)
            .distinct();
        if requires_manual_review {
            query = query.filter(scoped_user::id.eq_any(matching_ids))
        } else {
            query = query.filter(diesel::dsl::not(scoped_user::id.eq_any(matching_ids)))
        }
    }

    // Filter on whether user has passed or failed
    if !params.statuses.is_empty() {
        let decision_statuses: Vec<_> = params.statuses.into_iter().map(DecisionStatus::from).collect();
        let matching_ids = onboarding_decision::table
            .inner_join(onboarding::table)
            .filter(onboarding_decision::status.eq_any(decision_statuses))
            .filter(onboarding_decision::deactivated_at.is_null())
            .select(onboarding::scoped_user_id);
        query = query.filter(scoped_user::id.eq_any(matching_ids))
    }

    if let Some(footprint_user_id) = params.footprint_user_id {
        query = query.filter(scoped_user::fp_user_id.eq(footprint_user_id))
    }

    if let Some(timestamp_lte) = params.timestamp_lte {
        query = query.filter(scoped_user::start_timestamp.le(timestamp_lte))
    }

    if let Some(timestamp_gte) = params.timestamp_gte {
        query = query.filter(scoped_user::start_timestamp.ge(timestamp_gte))
    }

    if let Some(fingerprints) = params.fingerprints {
        let matching_uv_ids = fingerprint::table
            .inner_join(data_lifetime::table)
            // Active lifetimes - all active rows that are portable
            // TODO should also be able to search speculative fingerprints made by this tenant.
            // But diesel doesn't let you join on scoped_user and use it in a subquery
            // Might be able to execute this subquery and then use it - I don't think results
            // would be large
            .filter(data_lifetime::deactivated_seqno.is_null())
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            // Matching fingerprint
            .filter(fingerprint::sh_data.eq_any(fingerprints))
            .select(data_lifetime::user_vault_id);
        query = query.filter(scoped_user::user_vault_id.eq_any(matching_uv_ids))
    }

    query
}

pub fn count_authorized_for_tenant(
    conn: &mut PgConnection,
    params: OnboardingListQueryParams,
) -> Result<i64, DbError> {
    let count = list_authorized_for_tenant_query(params)
        .count()
        .get_result(conn)?;
    Ok(count)
}

/// lists all scoped_users across all configurations
pub fn list_authorized_for_tenant(
    conn: &mut PgConnection,
    params: OnboardingListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<(ScopedUser, UserVault)>, DbError> {
    let mut scoped_users = list_authorized_for_tenant_query(params)
        .order_by(schema::scoped_user::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        scoped_users = scoped_users.filter(schema::scoped_user::ordering_id.le(cursor));
    }

    let results = scoped_users
        .inner_join(schema::user_vault::table)
        .select((schema::scoped_user::all_columns, schema::user_vault::all_columns))
        .get_results(conn)?;
    Ok(results)
}
