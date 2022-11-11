use crate::models::scoped_user::ScopedUser;
use crate::schema;
use crate::{errors::DbError, schema::scoped_user::BoxedQuery};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::{DecisionStatus, Fingerprint, FootprintUserId, TenantId, VisibleOnboardingStatus};

#[derive(Clone)]
pub struct OnboardingListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<VisibleOnboardingStatus>,
    pub fingerprints: Option<Vec<Fingerprint>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
}

pub fn list_authorized_for_tenant_query<'a>(params: OnboardingListQueryParams) -> BoxedQuery<'a, Pg> {
    // Filter out onboardings that haven't been explicitly authorized by the user - these should
    // not be visible in the dashboard since the tenant doesn't have permissions to view anything
    // about the user
    use crate::schema::{fingerprint, manual_review, onboarding, onboarding_decision, scoped_user};
    let authorized_ids = onboarding::table
        .filter(onboarding::is_authorized.eq(true))
        .select(onboarding::scoped_user_id)
        .distinct();

    let mut query = scoped_user::table
        .filter(scoped_user::tenant_id.eq(params.tenant_id))
        .filter(scoped_user::is_live.eq(params.is_live))
        .filter(scoped_user::id.eq_any(authorized_ids))
        .into_boxed();

    if !params.statuses.is_empty() {
        // Find all onboardings with a manual review if selected
        let mut ob_query = onboarding::table.into_boxed();
        if params.statuses.contains(&VisibleOnboardingStatus::ManualReview) {
            let matching_ob_ids = manual_review::table
                .filter(manual_review::completed_at.is_null())
                .select(manual_review::onboarding_id)
                .distinct();
            ob_query = ob_query.or_filter(onboarding::id.eq_any(matching_ob_ids));
        }

        // Find all onboardings with a pass/fail decision if selected
        let decision_statuses: Vec<_> = [
            params
                .statuses
                .contains(&VisibleOnboardingStatus::Pass)
                .then_some(DecisionStatus::Pass),
            params
                .statuses
                .contains(&VisibleOnboardingStatus::Fail)
                .then_some(DecisionStatus::Fail),
        ]
        .into_iter()
        .flatten()
        .collect();
        if !decision_statuses.is_empty() {
            let matching_ob_ids = onboarding_decision::table
                .filter(onboarding_decision::status.eq_any(decision_statuses))
                .filter(onboarding_decision::deactivated_at.is_null())
                .select(onboarding_decision::onboarding_id);
            ob_query = ob_query.or_filter(onboarding::id.eq_any(matching_ob_ids));
        }
        let matching_ids = ob_query.select(onboarding::scoped_user_id).distinct();
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
            .filter(fingerprint::user_vault_id.eq(scoped_user::user_vault_id))
            .filter(fingerprint::deactivated_at.is_null())
            .filter(fingerprint::sh_data.eq_any(fingerprints))
            .select(fingerprint::user_vault_id)
            .distinct();
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
) -> Result<Vec<ScopedUser>, DbError> {
    let mut scoped_users = list_authorized_for_tenant_query(params)
        .order_by(schema::scoped_user::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        scoped_users = scoped_users.filter(schema::scoped_user::ordering_id.le(cursor));
    }

    let scoped_users = scoped_users.load::<ScopedUser>(conn)?;
    Ok(scoped_users)
}
