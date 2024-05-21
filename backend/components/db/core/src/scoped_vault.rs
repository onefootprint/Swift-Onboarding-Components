use crate::{
    models::{scoped_vault::ScopedVault, vault::Vault},
    DbResult, PgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema::{self, vault};
use diesel::{dsl::not, prelude::*};
use itertools::Itertools;
use newtypes::{
    output::Csv, ExternalId, Fingerprint, FpId, LabelKind, ObConfigurationId, OnboardingStatus,
    OnboardingStatusFilter, PiiString, ScopedVaultCursor, ScopedVaultCursorKind, TenantId, VaultKind,
    WatchlistCheckStatusKind,
};
use tracing::instrument;

#[derive(Debug, Clone, Default)]
pub struct ScopedVaultListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<OnboardingStatusFilter>,
    pub search: Option<SearchQuery>,
    pub fp_id: Option<FpId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
    pub watchlist_hit: Option<bool>,
    pub kind: Option<VaultKind>,
    /// Temporary - only show vaults that are visible to be shown in search
    pub only_visible: bool,
    pub playbook_ids: Option<Vec<ObConfigurationId>>,
    pub has_outstanding_workflow_request: Option<bool>,
    pub external_id: Option<ExternalId>,
    pub labels: Vec<LabelKind>,
}

#[derive(Debug, Clone, Default)]
pub struct SearchQuery {
    /// Plaintext search query. Will perform an ilike on plaintext data to try to find matches
    pub search: PiiString,
    /// Fingerprint search queries. Results will match ANY of the FingerprintQueries
    pub fingerprint_queries: Vec<Fingerprint>,
}

/// Composes the query to fetch authorized users matching the provided filter params.
/// Requires the `conn` only to execute one subquery because diesel doesn't like it. Returns a box
/// query that must still be executed
macro_rules! list_query {
    ($params: ident) => {{
        // Filter out onboardings that haven't been explicitly authorized by the user - these should
        // not be visible in the dashboard since the tenant doesn't have permissions to view anything
        // about the user
        use db_schema::schema::{
            manual_review, scoped_vault, scoped_vault_label, watchlist_check, workflow, workflow_request, fingerprint
        };
        let mut query = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(&$params.tenant_id))
            .filter(scoped_vault::is_live.eq($params.is_live))
            .filter(scoped_vault::deactivated_at.is_null())
            .into_boxed();

        if $params.only_visible {
            query = query.filter(scoped_vault::show_in_search.eq(true));
        }

        // Filter on whether user is in manual review
        if let Some(requires_manual_review) = $params.requires_manual_review {
            let matching_ids = manual_review::table
                .filter(manual_review::completed_at.is_null())
                .select(manual_review::scoped_vault_id)
                .distinct();
            if requires_manual_review {
                query = query.filter(scoped_vault::id.eq_any(matching_ids))
            } else {
                query = query.filter(diesel::dsl::not(scoped_vault::id.eq_any(matching_ids)))
            }
        }

        // Filter on whether user has a watchlist hit
        if let Some(watchlist_hit) = $params.watchlist_hit.as_ref() {
            let matching_ids = watchlist_check::table
                .filter(watchlist_check::status.eq(WatchlistCheckStatusKind::Fail))
                .filter(watchlist_check::deactivated_at.is_null())
                .filter(not(watchlist_check::completed_at.is_null()))
                .select(watchlist_check::scoped_vault_id)
                .distinct();
            if *watchlist_hit {
                query = query.filter(scoped_vault::id.eq_any(matching_ids))
            } else {
                query = query.filter(diesel::dsl::not(scoped_vault::id.eq_any(matching_ids)))
            }
        }

        // Filter on onboarding status: pass/fail/incomplete/vault only
        if !$params.statuses.is_empty() {
            // Filter on non-portable users
            let q_none_status = if $params.statuses.contains(&OnboardingStatusFilter::None) {
                Some(scoped_vault::status.is_null())
            } else {
                None
            };

            let onboarding_status: Vec<_> = $params
                .statuses
                .iter()
                .flat_map(OnboardingStatus::try_from)
                .collect();

            let q_onboarding_status = if !onboarding_status.is_empty() {
                Some(scoped_vault::status.eq_any(onboarding_status))
            } else {
                None
            };

            // This is tricky... If any filtering status is provided, we only want to return results
            // that match the filters. But, the filters are determined through a handful of different
            // queries.
            match (q_none_status, q_onboarding_status) {
                (Some(q1), Some(q2)) => query = query.filter(q1.or(q2)),
                (Some(q1), None) => query = query.filter(q1),
                (None, Some(q1)) => query = query.filter(q1),
                (None, None) => {}
            }
        }

        if let Some(fp_id) = $params.fp_id.as_ref() {
            query = query.filter(scoped_vault::fp_id.eq(fp_id))
        }

        if let Some(timestamp_lte) = $params.timestamp_lte {
            query = query.filter(scoped_vault::start_timestamp.le(timestamp_lte))
        }

        if let Some(timestamp_gte) = $params.timestamp_gte {
            query = query.filter(scoped_vault::start_timestamp.ge(timestamp_gte))
        }

        if let Some(kind) = $params.kind.as_ref() {
            query = query.filter(scoped_vault::kind.eq(kind))
        }

        if let Some(playbook_ids) = $params.playbook_ids.as_ref() {
            let matching_ids = workflow::table
                .filter(workflow::ob_configuration_id.eq_any(playbook_ids))
                .select(workflow::scoped_vault_id)
                .distinct();
            query = query.filter(scoped_vault::id.eq_any(matching_ids))
        }

        if let Some(has_outstanding_workflow_request) = $params.has_outstanding_workflow_request.as_ref() {
            let matching_ids = workflow_request::table
                .filter(workflow_request::deactivated_at.is_null())
                .select(workflow_request::scoped_vault_id)
                .distinct();
            if *has_outstanding_workflow_request {
                query = query.filter(scoped_vault::id.eq_any(matching_ids))
            } else {
                query = query.filter(not(scoped_vault::id.eq_any(matching_ids)))
            }
        }

        if let Some(external_id) = $params.external_id.as_ref() {
            query = query.filter(scoped_vault::external_id.eq(external_id))
        }

        if !$params.labels.is_empty() {
            let matching_ids = scoped_vault_label::table
                .filter(scoped_vault_label::deactivated_at.is_null())
                .filter(scoped_vault_label::kind.eq_any(&$params.labels))
                .select(scoped_vault_label::scoped_vault_id)
                .distinct();
            query = query.filter(scoped_vault::id.eq_any(matching_ids))
        }

        if let Some(search) = $params.search.as_ref() {
            let SearchQuery { search, fingerprint_queries } = search;
            // Search both plaintext results and fingerprinted results
            let plaintext_results = {
                tracing::info!(search_len=%search.len(), "Searching for plaintext results");
                let plaintext_search = format!("%{}%", search.leak());
                // Be careful changing this query - it's optimized to use a specific index
                fingerprint::table
                    .filter(fingerprint::deactivated_at.is_null())
                    .filter(fingerprint::tenant_id.eq(&$params.tenant_id))
                    .filter(fingerprint::is_live.eq(&$params.is_live))
                    .filter(fingerprint::is_hidden.eq(false))
                    // Matching filter
                    .filter(fingerprint::p_data.is_not_null())
                    .filter(fingerprint::p_data.ilike(plaintext_search))
                    .select(fingerprint::scoped_vault_id)
            };

            let fingerprint_results = {
                tracing::info!(sh_datas=%Csv::from(fingerprint_queries.iter().cloned().collect_vec()), "Searching for fingerprint results");
                // Be careful changing this query - it's optimized to use a specific index
                fingerprint::table
                    .filter(fingerprint::deactivated_at.is_null())
                    .filter(fingerprint::tenant_id.eq(&$params.tenant_id))
                    .filter(fingerprint::is_live.eq(&$params.is_live))
                    .filter(fingerprint::is_hidden.eq(false))
                    // Matching filter
                    .filter(fingerprint::sh_data.is_not_null())
                    .filter(fingerprint::sh_data.eq_any(fingerprint_queries))
                    .select(fingerprint::scoped_vault_id)
            };

            query = query.filter(scoped_vault::id.eq_any(plaintext_results).or(scoped_vault::id.eq_any(fingerprint_results)))
        }

        query
    }};
}

#[instrument(skip_all)]
fn list(
    conn: &mut PgConn,
    params: &ScopedVaultListQueryParams,
    cursor: Option<ScopedVaultCursor>,
    order_by: ScopedVaultCursorKind,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let query = list_query!(params);

    let mut scoped_vaults = query.inner_join(vault::table).limit(page_size);

    if let Some(cursor) = cursor {
        match cursor {
            ScopedVaultCursor::OrderingId(c) => {
                scoped_vaults = scoped_vaults.filter(schema::scoped_vault::ordering_id.le(c))
            }
            ScopedVaultCursor::LastActivityAt(c) => {
                scoped_vaults = scoped_vaults.filter(schema::scoped_vault::last_activity_at.le(c))
            }
        }
    }

    match order_by {
        ScopedVaultCursorKind::OrderingId => {
            scoped_vaults = scoped_vaults.order_by(schema::scoped_vault::ordering_id.desc())
        }
        ScopedVaultCursorKind::LastActivityAt => {
            scoped_vaults = scoped_vaults.order_by(schema::scoped_vault::last_activity_at.desc())
        }
    }

    let results = scoped_vaults
        .select((schema::scoped_vault::all_columns, schema::vault::all_columns))
        .get_results(conn)?;
    Ok(results)
}

/// lists all scoped_vaults across all configurations
#[instrument(skip_all)]
pub fn list_authorized_for_tenant(
    conn: &mut PgConn,
    params: &ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let cursor = cursor.map(ScopedVaultCursor::OrderingId);
    list(conn, params, cursor, ScopedVaultCursorKind::OrderingId, page_size)
}

#[instrument(skip_all)]
pub fn count_for_tenant(conn: &mut PgConn, params: ScopedVaultListQueryParams) -> DbResult<i64> {
    let count = list_query!(params).count().get_result(conn)?;
    Ok(count)
}

/// List and count all scoped vaults matching the search params. Use this if you need both the
/// count of results and the results themselves - this util saves and reuses some intermediate
/// computation
#[instrument(skip_all)]
pub fn list_and_count_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<ScopedVaultCursor>,
    order_by: ScopedVaultCursorKind,
    page_size: i64,
) -> DbResult<(Vec<(ScopedVault, Vault)>, i64)> {
    let results = list(conn, &params, cursor, order_by, page_size)?;
    let count = count_for_tenant(conn, params)?;
    Ok((results, count))
}
