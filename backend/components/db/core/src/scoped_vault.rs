use crate::{
    models::{scoped_vault::ScopedVault, vault::Vault},
    DbResult, PgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema;
use diesel::{dsl::not, prelude::*};
use itertools::Itertools;
use newtypes::{
    output::Csv, ExternalId, Fingerprint, FpId, LabelKind, ObConfigurationId, OnboardingStatus,
    OnboardingStatusFilter, PiiString, ScopedVaultCursor, ScopedVaultCursorKind, ScopedVaultId, TenantId,
    VaultKind, WatchlistCheckStatusKind, WorkflowKind,
};
use std::collections::HashMap;
use tracing::instrument;

#[derive(Debug, Clone, Default)]
pub struct ScopedVaultListQueryParams<TSearch = SearchQuery> {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<OnboardingStatusFilter>,
    pub search: Option<TSearch>,
    pub fp_id: Option<FpId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
    pub watchlist_hit: Option<bool>,
    pub kind: Option<VaultKind>,
    /// Temporary - only show vaults that are visible to be shown in search
    pub only_visible: bool,
    pub is_created_via_api: Option<bool>,
    pub playbook_id: Option<ObConfigurationId>,
    pub has_outstanding_workflow_request: Option<bool>,
    pub external_id: Option<ExternalId>,
    pub labels: Vec<LabelKind>,
}

#[derive(Debug, Clone, Default)]
pub struct SearchQuery {
    /// Plaintext search query. Will perform an ilike on plaintext data to try to find matches
    pub search: PiiString,
    /// Fingerprint search queries. Results will match ANY of the FingerprintQueries, where a
    /// FingerprintQuery matches if ALL of the fingerprints in the query are matched
    pub fingerprint_queries: Vec<AndFingerprintQuery>,
}

#[derive(Debug, Clone, Default)]
/// Fingerprint search query. For a vault to this query, it must match ALL of the fingerprints in the Vec.
pub struct AndFingerprintQuery(pub Vec<Fingerprint>);

impl ScopedVaultListQueryParams {
    fn map_search(self, conn: &mut PgConn) -> DbResult<ScopedVaultListQueryParams<Vec<ScopedVaultId>>> {
        let Self {
            tenant_id,
            is_live,
            statuses,
            search,
            fp_id,
            timestamp_lte,
            timestamp_gte,
            requires_manual_review,
            watchlist_hit,
            kind,
            only_visible,
            is_created_via_api,
            playbook_id,
            has_outstanding_workflow_request,
            external_id,
            labels,
        } = self;

        let matching_vaults = if let Some(search) = search {
            let vault_ids = vaults_matching_search(conn, search, &tenant_id)?;
            Some(vault_ids)
        } else {
            None
        };

        let result = ScopedVaultListQueryParams {
            tenant_id,
            is_live,
            statuses,
            search: matching_vaults,
            fp_id,
            timestamp_lte,
            timestamp_gte,
            requires_manual_review,
            watchlist_hit,
            kind,
            only_visible,
            is_created_via_api,
            playbook_id,
            has_outstanding_workflow_request,
            external_id,
            labels,
        };
        Ok(result)
    }
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
            manual_review, scoped_vault, scoped_vault_label, vault, watchlist_check, workflow,
            workflow_request,
        };
        let mut query = scoped_vault::table
            .inner_join(vault::table)
            .filter(scoped_vault::tenant_id.eq(&$params.tenant_id))
            .filter(scoped_vault::is_live.eq($params.is_live))
            .into_boxed();

        if $params.only_visible {
            query = query.filter(scoped_vault::show_in_search.eq(true));
        }

        if let Some(is_created_via_api) = $params.is_created_via_api {
            query = query.filter(vault::is_created_via_api.eq(is_created_via_api));
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
            query = query.filter(vault::kind.eq(kind))
        }

        if let Some(playbook_id) = $params.playbook_id.as_ref() {
            let matching_ids = workflow::table
                .filter(workflow::ob_configuration_id.eq(playbook_id))
                .select(workflow::scoped_vault_id)
                .distinct();
            query = query.filter(scoped_vault::id.eq_any(matching_ids))
        }

        if let Some(has_outstanding_workflow_request) = $params.has_outstanding_workflow_request.as_ref() {
            let matching_ids = workflow_request::table
                .filter(workflow_request::deactivated_at.is_null())
                .select(workflow_request::scoped_vault_id)
                .distinct();
            let matching_ids2 = workflow::table
                .filter(workflow::kind.eq(WorkflowKind::Document))
                .filter(workflow::completed_at.is_null())
                .filter(workflow::deactivated_at.is_null())
                .select(workflow::scoped_vault_id);
            if *has_outstanding_workflow_request {
                query = query.filter(
                    scoped_vault::id
                        .eq_any(matching_ids)
                        .or(scoped_vault::id.eq_any(matching_ids2)),
                )
            } else {
                query = query
                    .filter(not(scoped_vault::id.eq_any(matching_ids)))
                    .filter(not(scoped_vault::id.eq_any(matching_ids2)))
            }
        }

        if let Some(sv_ids) = $params.search.as_ref() {
            query = query.filter(scoped_vault::id.eq_any(sv_ids))
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

        query
    }};
}

#[instrument(skip_all)]
fn vaults_matching_search(
    conn: &mut PgConn,
    search: SearchQuery,
    tenant_id: &TenantId,
) -> DbResult<Vec<ScopedVaultId>> {
    use db_schema::schema::{data_lifetime, fingerprint, scoped_vault, vault_data};
    let SearchQuery {
        search,
        fingerprint_queries,
    } = search;
    // Search both plaintext results and fingerprinted results
    let plaintext_results = {
        // This is extremely specific - gin indexes have really slow performance on large tables when
        // doing a "contains" operation with 2 or fewer characteres.
        // So, we cheat a bit and just do a prefix search when the search query is < 2 characters
        let plaintext_search = if search.len() <= 2 {
            // Just prefix search
            format!("{}%", search.leak())
        } else {
            // Full contains search
            format!("%{}%", search.leak())
        };

        vault_data::table
            .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
            .filter(data_lifetime::deactivated_seqno.is_null())
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            // Matching filter
            .filter(vault_data::p_data.ilike(&plaintext_search))
            .select(scoped_vault::id)
            .get_results(conn)?
    };

    let fingerprint_results = {
        let all_fps = fingerprint_queries
            .iter()
            .flat_map(|fps| &fps.0)
            .unique()
            .collect_vec();
        tracing::info!(sh_datas=%Csv::from(all_fps.iter().cloned().collect_vec()), "Searching for fingerprints");

        let results: HashMap<_, _> = fingerprint::table
            .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
            .filter(data_lifetime::deactivated_seqno.is_null())
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            // Matching filter
            .filter(fingerprint::sh_data.eq_any(all_fps.clone()))
            .select((fingerprint::sh_data, data_lifetime::scoped_vault_id))
            .get_results::<(Fingerprint, ScopedVaultId)>(conn)?
            .into_iter()
            .into_group_map();

        // Compose the list of vaults that match _any_ of the FingerprintQueries
        fingerprint_queries
            .into_iter()
            .flat_map(|fps| {
                // Each inner FingerprintQuery represents an AND filter.
                // Return only the vaults that match all fingerprints in the FingerprintQuery.
                fps.0
                    .iter()
                    .cloned()
                    .map(|fp| results.get(&fp).cloned().unwrap_or_default())
                    .reduce(|a, b| a.into_iter().filter(|i| b.contains(i)).collect_vec())
                    .unwrap_or_default()
            })
            .unique()
            .collect_vec()
    };
    let all_ids = fingerprint_results
        .into_iter()
        .chain(plaintext_results)
        .unique()
        .collect();
    Ok(all_ids)
}

#[instrument(skip_all)]
fn list(
    conn: &mut PgConn,
    params: &ScopedVaultListQueryParams<Vec<ScopedVaultId>>,
    cursor: Option<ScopedVaultCursor>,
    order_by: ScopedVaultCursorKind,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let query = list_query!(params);

    let mut scoped_vaults = query.limit(page_size);

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
    params: ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let params = &params.map_search(conn)?;
    let cursor = cursor.map(ScopedVaultCursor::OrderingId);
    list(conn, params, cursor, ScopedVaultCursorKind::OrderingId, page_size)
}

#[instrument(skip_all)]
pub fn count_for_tenant(conn: &mut PgConn, params: ScopedVaultListQueryParams) -> DbResult<i64> {
    let params = &params.map_search(conn)?;
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
    let params = &params.map_search(conn)?;

    let results = list(conn, params, cursor, order_by, page_size)?;
    let count = list_query!(params).count().get_result(conn)?;
    Ok((results, count))
}
