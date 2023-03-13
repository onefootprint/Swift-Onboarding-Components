use crate::models::scoped_vault::ScopedVault;
use crate::models::vault::Vault;
use crate::schema;
use crate::PgConn;
use crate::{errors::DbError, schema::scoped_user::BoxedQuery};
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::OnboardingStatusFilter;
use newtypes::VaultKind;
use newtypes::{DecisionStatus, Fingerprint, FootprintUserId, TenantId};

#[derive(Clone, Default)]
pub struct ScopedVaultListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    /// When true, only returns the scoped users that are either (1) authorized or (2) non-portable
    pub only_billable: bool,
    pub statuses: Vec<OnboardingStatusFilter>,
    pub fingerprints: Option<Vec<Fingerprint>>,
    pub footprint_user_id: Option<FootprintUserId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
    pub kind: Option<VaultKind>,
}

pub fn list_authorized_for_tenant_query<'a>(params: ScopedVaultListQueryParams) -> BoxedQuery<'a, Pg> {
    // Filter out onboardings that haven't been explicitly authorized by the user - these should
    // not be visible in the dashboard since the tenant doesn't have permissions to view anything
    // about the user
    use crate::schema::{
        data_lifetime, fingerprint, manual_review, onboarding, onboarding_decision, scoped_user, user_vault,
    };
    let mut query = scoped_user::table
        .filter(scoped_user::tenant_id.eq(params.tenant_id))
        .filter(scoped_user::is_live.eq(params.is_live))
        .into_boxed();

    if params.only_billable {
        // Only allow seeing any authorized scoped users for portable vaults OR non-portable vaults
        // owned by the tenant
        let authorized_ids = onboarding::table
            .filter(not(onboarding::authorized_at.is_null()))
            .select(onboarding::scoped_user_id)
            .distinct();
        let non_portable_vault_ids = user_vault::table
            .filter(user_vault::is_portable.eq(false))
            .select(user_vault::id);
        query = query.filter(
            scoped_user::id
                .eq_any(authorized_ids)
                .or(scoped_user::user_vault_id.eq_any(non_portable_vault_ids)),
        );
    }

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

    // Filter on onboarding status: pass/fail/incomplete/vault only
    if !params.statuses.is_empty() {
        // Filter on incomplete users that never authorized the onboarding
        let q_incomplete = if params.statuses.contains(&OnboardingStatusFilter::Incomplete) {
            let su_ids = onboarding::table
                .filter(onboarding::authorized_at.is_null())
                .select(onboarding::scoped_user_id);
            Some(scoped_user::id.eq_any(su_ids))
        } else {
            None
        };

        // Filter on non-portable users
        let q_vault_only = if params.statuses.contains(&OnboardingStatusFilter::VaultOnly) {
            let uv_ids = user_vault::table
                .filter(user_vault::is_portable.eq(false))
                .select(user_vault::id);
            Some(scoped_user::user_vault_id.eq_any(uv_ids))
        } else {
            None
        };

        // Filter on authorized OBs with a given decision status
        let decision_statuses: Vec<_> = params
            .statuses
            .iter()
            .filter_map(DecisionStatus::try_from)
            .collect();
        let q_decision_status = if !decision_statuses.is_empty() {
            let su_ids = onboarding_decision::table
                .inner_join(onboarding::table)
                .filter(onboarding_decision::status.eq_any(decision_statuses))
                .filter(onboarding_decision::deactivated_at.is_null())
                .filter(not(onboarding::authorized_at.is_null()))
                .select(onboarding::scoped_user_id);
            Some(scoped_user::id.eq_any(su_ids))
        } else {
            None
        };
        // This is tricky... If any filtering status is provided, we only want to return results
        // that match the filters. But, the filters are determined through a handful of different
        // queries.
        match (q_incomplete, q_vault_only, q_decision_status) {
            (Some(q1), Some(q2), Some(q3)) => query = query.filter(q1.or(q2).or(q3)),
            (Some(q1), Some(q2), None) => query = query.filter(q1.or(q2)),
            (Some(q1), None, Some(q2)) => query = query.filter(q1.or(q2)),
            (None, Some(q1), Some(q2)) => query = query.filter(q1.or(q2)),
            (Some(q1), None, None) => query = query.filter(q1),
            (None, Some(q1), None) => query = query.filter(q1),
            (None, None, Some(q1)) => query = query.filter(q1),
            (None, None, None) => {}
        }
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

    if let Some(kind) = params.kind {
        let uv_ids = user_vault::table
            .filter(user_vault::kind.eq(kind))
            .select(user_vault::id);
        query = query.filter(scoped_user::user_vault_id.eq_any(uv_ids))
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
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
) -> Result<i64, DbError> {
    let count = list_authorized_for_tenant_query(params)
        .count()
        .get_result(conn)?;
    Ok(count)
}

/// lists all scoped_users across all configurations
pub fn list_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> Result<Vec<(ScopedVault, Vault)>, DbError> {
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
