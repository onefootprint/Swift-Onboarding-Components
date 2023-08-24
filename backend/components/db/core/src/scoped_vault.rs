use crate::models::scoped_vault::ScopedVault;
use crate::models::vault::Vault;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema;
use diesel::dsl::not;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use newtypes::OnboardingStatusFilter;
use newtypes::PiiString;
use newtypes::VaultId;
use newtypes::VaultKind;
use newtypes::WatchlistCheckStatusKind;
use newtypes::{Fingerprint, FpId, TenantId};
use tracing::instrument;

#[derive(Debug, Clone, Default)]
pub struct ScopedVaultListQueryParams<TSearch = (PiiString, Vec<Fingerprint>)> {
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
}

impl ScopedVaultListQueryParams {
    fn map_search(self, conn: &mut PgConn) -> DbResult<ScopedVaultListQueryParams<Vec<VaultId>>> {
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
        } = self;

        let matching_vaults = if let Some((search, fingerprints)) = search.as_ref() {
            let vault_ids = vaults_matching_search(conn, search, fingerprints, &tenant_id)?;
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
        use db_schema::schema::{manual_review, scoped_vault, vault, watchlist_check, workflow};
        let mut query = scoped_vault::table
            .inner_join(vault::table)
            .filter(scoped_vault::tenant_id.eq(&$params.tenant_id))
            .filter(scoped_vault::is_live.eq($params.is_live))
            .into_boxed();

        // Filter on whether user is in manual review
        if let Some(requires_manual_review) = $params.requires_manual_review {
            let matching_ids = manual_review::table
                .filter(manual_review::completed_at.is_null())
                .inner_join(workflow::table)
                .select(workflow::scoped_vault_id)
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

        if let Some(vault_ids) = $params.search.as_ref() {
            query = query.filter(vault::id.eq_any(vault_ids))
        }
        query
    }};
}

fn vaults_matching_search(
    conn: &mut PgConn,
    search: &PiiString,
    fingerprints: &[Fingerprint],
    tenant_id: &TenantId,
) -> DbResult<Vec<VaultId>> {
    use db_schema::schema::{data_lifetime, fingerprint, scoped_vault, vault_data};
    // We have to basically replicate the DataLifetime::get_active inside a SQL query -
    // fingerprints for a piece of data for a given tenant A should be visible if either:
    // - the data is not portablized but was added by tenant A
    // - the data is portablized (could be added by any tenant)
    // These two subqueries handle each case respectively

    // Specifically get the matching vault_ids (the scoped_vault_id might belong to another tenant)
    // Sadly, diesel doesn't let you join on scoped_vault and use it in a subquery on the
    // scoped_vault table... So, we have to actually execute these subqueries
    let matching_speculative_fp_ids: Vec<VaultId> = fingerprint::table
        .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
        // SPECULATIVE visibility filters
        .filter(data_lifetime::deactivated_seqno.is_null())
        .filter(data_lifetime::portablized_seqno.is_null())
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        // Matching filter
        .filter(fingerprint::sh_data.eq_any(fingerprints))
        .select(data_lifetime::vault_id)
        .get_results(conn)?;

    // TODO we should store the plaintext on the fingerprint table so all searching
    // happens on one table
    let matching_speculative_plaintext_ids: Vec<VaultId> = vault_data::table
        .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
        // SPECULATIVE visibility filters
        .filter(data_lifetime::deactivated_seqno.is_null())
        .filter(data_lifetime::portablized_seqno.is_null())
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        // Matching filter
        // TODO do we want to search every vault_data's p_data, or only certain kinds? i imagine card issuer will get annoying
        .filter(vault_data::p_data.ilike(format!("%{}%", search.leak())))
        .select(data_lifetime::vault_id)
        .get_results(conn)?;

    let matching_portable_fp_ids: Vec<VaultId> = fingerprint::table
        .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
        // PORTABLE visibility filters
        .filter(data_lifetime::deactivated_seqno.is_null())
        .filter(not(data_lifetime::portablized_seqno.is_null()))
        // Matching filter
        .filter(fingerprint::sh_data.eq_any(fingerprints))
        .select(data_lifetime::vault_id)
        .get_results(conn)?;

    let matching_portable_plaintext_ids: Vec<VaultId> = vault_data::table
        .inner_join(data_lifetime::table.inner_join(scoped_vault::table))
        // PORTABLE visibility filters
        .filter(data_lifetime::deactivated_seqno.is_null())
        .filter(not(data_lifetime::portablized_seqno.is_null()))
        // Matching filter
        .filter(vault_data::p_data.ilike(format!("%{}%", search.leak())))
        .select(data_lifetime::vault_id)
        .get_results(conn)?;

    let all_ids = vec![
        matching_speculative_fp_ids.into_iter(),
        matching_speculative_plaintext_ids.into_iter(),
        matching_portable_fp_ids.into_iter(),
        matching_portable_plaintext_ids.into_iter(),
    ]
    .into_iter()
    .flatten()
    .unique()
    .collect();
    Ok(all_ids)
}

fn list(
    conn: &mut PgConn,
    params: &ScopedVaultListQueryParams<Vec<VaultId>>,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let query = list_query!(params);

    let mut scoped_vaults = query
        .order_by(schema::scoped_vault::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        scoped_vaults = scoped_vaults.filter(schema::scoped_vault::ordering_id.le(cursor));
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
    list(conn, params, cursor, page_size)
}

/// List and count all scoped vaults matching the search params. Use this if you need both the
/// count of results and the results themselves - this util saves and reuses some intermediate
/// computation
#[instrument(skip_all)]
pub fn list_and_count_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<(Vec<(ScopedVault, Vault)>, i64)> {
    let params = &params.map_search(conn)?;

    let results = list(conn, params, cursor, page_size)?;
    let count = list_query!(params).count().get_result(conn)?;
    Ok((results, count))
}
